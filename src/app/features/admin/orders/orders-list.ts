import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AdminService } from '../../../core/services/admin.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-admin-orders-list',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    DatePipe
  ],
  template: `
    <main class="page-enter">
      <div class="container">

        <!-- Breadcrumb -->
        <nav class="breadcrumb">
          <a routerLink="/">Home</a>
          <span>/</span>
          <a routerLink="/">Admin</a>
          <span>/</span>
          <span>Orders</span>
        </nav>

        <!-- Page Header -->
        <div class="page-header">
          <div>
            <h1>Orders</h1>

            <p class="muted">
              {{ orders().length }}
              order{{ orders().length === 1 ? '' : 's' }}
            </p>
          </div>
        </div>

        <!-- Loading -->
        @if (loading()) {

          <div class="loading card">
            <div class="spinner"></div>
            <p>Loading orders...</p>
          </div>

        }

        <!-- No Orders -->
        @else if (orders().length === 0) {

          <div class="empty-state card">

            <div class="empty-icon">📦</div>

            <h2>No orders found</h2>

            <p>
              There are currently no orders to display.
            </p>

          </div>

        }

        <!-- Orders -->
        @else {

          <div class="orders-list">

            @for (order of orders(); track order.id) {

              <article class="order-card card">

                <!-- Order Header -->
                <div class="order-header">

                  <div>

                    <p class="order-number">
                      Order #{{ order.orderNumber }}
                    </p>

                    <p class="order-date">
                      {{ order.orderDate | date:'dd MMM yyyy, HH:mm' }}
                    </p>

                  </div>

                  <span
                    class="status"
                    [attr.data-status]="order.orderStatus">

                    {{ order.orderStatus }}

                  </span>

                </div>

                <!-- Order Body -->
                <div class="order-body">

                  <div class="order-info">

                    <!-- Customer -->
                    <div class="info-item">

                      <span class="label">
                        Customer
                      </span>

                      <span class="value">
                        {{ order.customerName || 'Guest Customer' }}
                      </span>

                    </div>

                    <!-- Phone -->
                    <div class="info-item">

                      <span class="label">
                        Phone
                      </span>

                      <span class="value">
                        {{ order.phone || 'N/A' }}
                      </span>

                    </div>

                    <!-- Payment -->
                    <div class="info-item">

                      <span class="label">
                        Payment
                      </span>

                      <span class="value">

                        {{
                          order.paymentMethod === 'CashOnDelivery'
                            ? 'Cash on Delivery'
                            : order.paymentMethod || 'N/A'
                        }}

                      </span>

                    </div>

                    <!-- Payment Status -->
                    <div class="info-item">

                      <span class="label">
                        Payment Status
                      </span>

                      <span
                        class="payment-status"
                        [attr.data-status]="order.paymentStatus">

                        {{ order.paymentStatus || 'Pending' }}

                      </span>

                    </div>

                  </div>

                  <!-- Total -->
                  <div class="order-total">

                    <span class="total-label">
                      Total
                    </span>

                    <strong>
                      Rs. {{ order.total | number }}
                    </strong>

                  </div>

                </div>

                <!-- Order Footer -->
                <div class="order-footer">

                  <span class="delivery-text">

                    Status:

                    <strong>
                      {{ order.orderStatus }}
                    </strong>

                  </span>

                  <a
                    [routerLink]="['/orders', order.id]"
                    class="btn btn-outline btn-sm">

                    View Order

                  </a>

                </div>

              </article>

            }

          </div>

        }

      </div>
    </main>
  `,

  styles: [

    `
    .breadcrumb {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      padding: 1.5rem 0 0.75rem;
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .breadcrumb a {
      color: var(--color-text-muted);
      text-decoration: none;
    }

    .breadcrumb a:hover {
      color: var(--color-primary);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    h1 {
      font-size: 1.9rem;
      margin-bottom: 0.25rem;
    }

    .muted {
      color: var(--color-text-muted);
      font-size: 0.9rem;
      margin: 0;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding-bottom: 4rem;
    }

    .order-card {
      padding: 0;
      overflow: hidden;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--color-border);
      background: var(--color-blush);
    }

    .order-number {
      font-weight: 600;
      margin: 0 0 0.25rem;
      color: var(--color-primary-dark);
    }

    .order-date {
      color: var(--color-text-muted);
      font-size: 0.8rem;
      margin: 0;
    }

    .status {
      display: inline-block;
      padding: 0.3rem 0.7rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .status[data-status="Pending"] {
      background: #fff3e0;
      color: #e65100;
    }

    .status[data-status="Confirmed"],
    .status[data-status="Processing"],
    .status[data-status="Packed"] {
      background: #e3f2fd;
      color: #1565c0;
    }

    .status[data-status="Shipped"],
    .status[data-status="OutForDelivery"] {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .status[data-status="Delivered"] {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .status[data-status="Cancelled"],
    .status[data-status="Returned"],
    .status[data-status="Refunded"] {
      background: #fce4ec;
      color: #c62828;
    }

    .order-body {
      padding: 1.25rem 1.5rem;
      display: flex;
      justify-content: space-between;
      gap: 2rem;
      align-items: center;
    }

    .order-info {
      display: grid;
      grid-template-columns: repeat(4, minmax(120px, 1fr));
      gap: 1.5rem;
      flex: 1;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 0;
    }

    .label {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .value {
      font-size: 0.9rem;
      font-weight: 500;
      overflow-wrap: anywhere;
    }

    .payment-status {
      font-size: 0.85rem;
      font-weight: 500;
    }

    .payment-status[data-status="Paid"] {
      color: var(--color-success);
    }

    .payment-status[data-status="Pending"] {
      color: var(--color-warning);
    }

    .order-total {
      min-width: 130px;
      text-align: right;
    }

    .total-label {
      display: block;
      color: var(--color-text-muted);
      font-size: 0.75rem;
      margin-bottom: 0.25rem;
    }

    .order-total strong {
      font-size: 1.1rem;
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--color-border);
    }

    .delivery-text {
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    .delivery-text strong {
      color: var(--color-text);
    }

    .empty-state {
      max-width: 550px;
      margin: 2rem auto 4rem;
      padding: 3rem 2rem;
      text-align: center;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state h2 {
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: var(--color-text-muted);
      margin-bottom: 1.5rem;
    }

    .loading {
      min-height: 250px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-bottom: 4rem;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 900px) {

      .order-body {
        flex-direction: column;
        align-items: stretch;
      }

      .order-info {
        grid-template-columns: repeat(2, 1fr);
      }

      .order-total {
        text-align: left;
      }

    }

    @media (max-width: 600px) {

      .order-header {
        align-items: flex-start;
        flex-direction: column;
      }

      .order-info {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .order-footer {
        align-items: stretch;
        flex-direction: column;
      }

      .order-footer .btn {
        width: 100%;
        text-align: center;
      }

    }
    `

  ]
})
export class AdminOrdersListComponent implements OnInit {

  // IMPORTANT:
  // Admin orders must use AdminService, not OrderService.
  private adminService = inject(AdminService);

  orders = signal<Order[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadOrders();
  }

  private loadOrders(): void {

    this.loading.set(true);

    this.adminService.getOrders().subscribe({

      next: (orders: Order[]) => {

        console.log(
          'Admin orders loaded:',
          orders
        );

        this.orders.set(orders);
        this.loading.set(false);

      },

      error: (error: unknown) => {

        console.error(
          'Failed to load admin orders:',
          error
        );

        this.orders.set([]);
        this.loading.set(false);

      }

    });

  }

}