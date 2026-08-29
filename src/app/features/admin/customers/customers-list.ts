import { Component } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-customers-list',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  template: `
    <div class="page-enter">
      <h1>Customers</h1>
      <p class="muted" style="margin-bottom: 1.25rem;">48 registered customers</p>
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
              @for (c of customers; track c.email) {
                <tr>
                  <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border); font-weight: 500;">{{ c.name }}</td>
                  <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border);">{{ c.email }}</td>
                  <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border);">{{ c.phone }}</td>
                  <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border);">{{ c.orders }}</td>
                  <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border);">Rs. {{ c.spent | number }}</td>
                  <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border);">{{ c.joined | date:'dd MMM yyyy' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`h1 { font-size: 1.6rem; margin-bottom: 0.2rem; } .muted { color: var(--color-text-muted); }`]
})
export class AdminCustomersListComponent {
  customers = [
    { name: 'Ayesha Khan', email: 'ayesha@example.com', phone: '0300-1234567', orders: 5, spent: 24500, joined: '2026-03-12' },
    { name: 'Sara Ahmed', email: 'sara@example.com', phone: '0321-9876543', orders: 3, spent: 12800, joined: '2026-04-01' },
    { name: 'Fatima Raza', email: 'fatima@example.com', phone: '0333-5551212', orders: 8, spent: 41200, joined: '2026-02-18' },
    { name: 'Hina Malik', email: 'hina@example.com', phone: '0345-1112233', orders: 2, spent: 5600, joined: '2026-05-22' },
    { name: 'Zara Ali', email: 'zara@example.com', phone: '0312-4445566', orders: 6, spent: 19800, joined: '2026-01-30' }
  ];
}
