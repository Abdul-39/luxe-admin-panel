import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { Review } from '../../../core/models';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="page-enter">
      <h1>Reviews</h1>
      <p style="color: var(--color-text-muted); margin-bottom: 1.25rem;">
        Moderate customer product reviews
        @if (!loading()) {
          — {{ reviews().length }} review{{ reviews().length === 1 ? '' : 's' }}
        }
      </p>

      @if (loading()) {
        <div class="card" style="padding: 2rem; text-align: center; color: var(--color-text-muted);">
          Loading reviews from the API…
        </div>
      } @else if (reviews().length === 0) {
        <div class="card" style="padding: 2rem; text-align: center; color: var(--color-text-muted);">
          <p style="margin-bottom: 0.5rem;">No reviews found.</p>
          <p style="font-size: 0.9rem;">
            Reviews will appear here once customers submit them and the backend
            <code>/api/reviews</code> (or <code>/api/admin/reviews</code>) endpoint is available.
          </p>
        </div>
      } @else {
        <div class="card" style="padding: 0; overflow: hidden;">
          <div style="overflow-x: auto;">
            <table style="width:100%; border-collapse: collapse; font-size: 0.9rem;">
              <thead>
                <tr>
                  <th style="text-align:left; padding: 0.85rem 1rem; background: var(--color-blush); font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted);">Customer</th>
                  <th style="text-align:left; padding: 0.85rem 1rem; background: var(--color-blush); font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted);">Product ID</th>
                  <th style="text-align:left; padding: 0.85rem 1rem; background: var(--color-blush); font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted);">Rating</th>
                  <th style="text-align:left; padding: 0.85rem 1rem; background: var(--color-blush); font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted);">Comment</th>
                  <th style="text-align:left; padding: 0.85rem 1rem; background: var(--color-blush); font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted);">Date</th>
                  <th style="text-align:left; padding: 0.85rem 1rem; background: var(--color-blush); font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted);">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (r of reviews(); track r.id) {
                  <tr>
                    <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border); font-weight: 500;">
                      {{ r.customerName || 'Customer #' + r.customerId }}
                    </td>
                    <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border);">
                      {{ r.productId }}
                    </td>
                    <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border);">
                      <span class="stars">{{ stars(r.rating) }}</span>
                      <span style="margin-left: 0.35rem; color: var(--color-text-muted);">{{ r.rating }}/5</span>
                    </td>
                    <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border); max-width: 280px;">
                      {{ r.comment || '—' }}
                    </td>
                    <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border);">
                      {{ r.createdAt | date:'dd MMM yyyy' }}
                    </td>
                    <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border);">
                      <button
                        type="button"
                        class="btn-delete"
                        (click)="onDelete(r.id)"
                        [disabled]="deletingId() === r.id"
                      >
                        {{ deletingId() === r.id ? 'Deleting…' : 'Delete' }}
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    h1 { font-size: 1.6rem; margin-bottom: 0.2rem; }
    .stars { color: #d4a017; letter-spacing: 1px; }
    .btn-delete {
      background: transparent;
      border: 1px solid #dc2626;
      color: #dc2626;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
    }
    .btn-delete:hover:not(:disabled) { background: #dc2626; color: #fff; }
    .btn-delete:disabled { opacity: 0.6; cursor: not-allowed; }
    code { font-size: 0.85em; background: var(--color-blush, #f5f0eb); padding: 0.1em 0.35em; border-radius: 4px; }
  `]
})
export class AdminReviewsComponent implements OnInit {
  private admin = inject(AdminService);

  reviews = signal<Review[]>([]);
  loading = signal(true);
  deletingId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading.set(true);
    this.admin.getReviews().subscribe({
      next: list => {
        this.reviews.set(list as Review[]);
        this.loading.set(false);
      },
      error: () => {
        this.reviews.set([]);
        this.loading.set(false);
      }
    });
  }

  stars(rating: number): string {
    const r = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  }

  onDelete(id: number): void {
    if (!confirm('Delete this review permanently?')) return;
    this.deletingId.set(id);
    this.admin.deleteReview(id).subscribe({
      next: ok => {
        this.deletingId.set(null);
        if (ok) {
          this.reviews.update(list => list.filter(r => r.id !== id));
        } else {
          alert('Could not delete review. The reviews API may not be available yet.');
        }
      },
      error: () => {
        this.deletingId.set(null);
        alert('Could not delete review. The reviews API may not be available yet.');
      }
    });
  }
}
