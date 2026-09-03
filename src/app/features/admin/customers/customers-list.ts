import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { AdminService, AdminCustomer } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-customers-list',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  template: `
    <div class="page-enter">
      <h1>Customers</h1>
      <p class="muted" style="margin-bottom: 1.25rem;">
        @if (loading()) {
          Loading customers…
        } @else {
          {{ customers().length }} registered customers
        }
      </p>

      @if (loading()) {
        <div class="card" style="padding: 2rem; text-align: center; color: var(--color-text-muted);">
          Loading customers from database…
        </div>
      } @else if (customers().length === 0) {
        <div class="card" style="padding: 2rem; text-align: center; color: var(--color-text-muted);">
          No customers found. Customers appear here once they place orders or register.
        </div>
      } @else {
        <div class="card" style="padding: 0; overflow: hidden;">
          <div style="overflow-x: auto;">
            <table style="width:100%; border-collapse: collapse; font-size: 0.9rem;">
              <thead>
                <tr>
                  <th style="text-align:left; padding: 0.85rem 1rem; background: var(--color-blush); font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted);">Name</th>
                  <th style="text-align:left; padding: 0.85rem 1rem; background: var(--color-blush); font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted);">Email</th>
                  <th style="text-align:left; padding: 0.85rem 1rem; background: var(--color-blush); font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted);">Phone</th>
                  <th style="text-align:left; padding: 0.85rem 1rem; background: var(--color-blush); font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted);">Orders</th>
                  <th style="text-align:left; padding: 0.85rem 1rem; background: var(--color-blush); font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted);">Spent</th>
                  <th style="text-align:left; padding: 0.85rem 1rem; background: var(--color-blush); font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted);">Joined</th>
                </tr>
              </thead>
              <tbody>
                @for (c of customers(); track c.email || c.name) {
                  <tr>
                    <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border); font-weight: 500;">{{ c.name }}</td>
                    <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border);">{{ c.email || '—' }}</td>
                    <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border);">{{ c.phone || '—' }}</td>
                    <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border);">{{ c.orders }}</td>
                    <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border);">Rs. {{ c.spent | number }}</td>
                    <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border);">{{ c.joined | date:'dd MMM yyyy' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`h1 { font-size: 1.6rem; margin-bottom: 0.2rem; } .muted { color: var(--color-text-muted); }`]
})
export class AdminCustomersListComponent implements OnInit {
  private admin = inject(AdminService);

  customers = signal<AdminCustomer[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.admin.getCustomers().subscribe({
      next: list => {
        this.customers.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.customers.set([]);
        this.loading.set(false);
      }
    });
  }
}
