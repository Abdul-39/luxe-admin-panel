import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-enter">
      <h1>Inventory</h1>
      <p class="muted" style="margin-bottom: 1.25rem;">Products at or below low-stock threshold</p>
      <div class="card" style="padding: 1.25rem;">
        @for (p of lowStock(); track p.id) {
          <div class="row">
            <div>
              <p class="name">{{ p.name }}</p>
              <p class="meta">Threshold: {{ p.threshold }}</p>
            </div>
            <span class="badge" [class.out]="p.stock === 0">{{ p.stock }} left</span>
            <a [routerLink]="['/products', p.id, 'edit']" class="btn btn-outline btn-sm">Restock</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    h1 { font-size: 1.6rem; margin-bottom: 0.2rem; }
    .muted { color: var(--color-text-muted); }
    .row {
      display: flex; align-items: center; gap: 1rem; padding: 0.85rem 0;
      border-bottom: 1px solid var(--color-border);
    }
    .row:last-child { border-bottom: none; }
    .name { font-weight: 500; }
    .meta { font-size: 0.85rem; color: var(--color-text-muted); }
    .badge {
      margin-left: auto; font-size: 0.85rem; font-weight: 600; padding: 0.25rem 0.6rem;
      border-radius: var(--radius-full); background: #fff3e0; color: #e65100;
    }
    .badge.out { background: #fce4ec; color: #c62828; }
  `]
})
export class AdminInventoryComponent implements OnInit {
  private admin = inject(AdminService);
  lowStock = signal<{ id: number; name: string; stock: number; threshold: number }[]>([]);

  ngOnInit(): void {
    this.admin.getLowStockProducts().subscribe(p => this.lowStock.set(p));
  }
}
