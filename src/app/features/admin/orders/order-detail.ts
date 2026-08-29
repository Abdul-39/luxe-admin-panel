import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order, OrderStatus } from '../../../core/models';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe, DatePipe],
  template: `
    <div class="page-enter">
      <nav class="breadcrumb">
        <a routerLink="/orders">Orders</a>
        <span>/</span>
        <span>{{ order()?.orderNumber || '...' }}</span>
      </nav>

      @if (loading()) {
        <div class="skeleton" style="height: 400px; border-radius: var(--radius-lg);"></div>
      } @else if (!order()) {
        <div class="empty-state card">
          <h3>Order not found</h3>
          <a routerLink="/orders" class="btn btn-primary">Back to Orders</a>
        </div>
      } @else {
        <div class="detail-header">
          <div>
            <h1>{{ order()!.orderNumber }}</h1>
            <p class="muted">Placed {{ order()!.orderDate | date:'dd MMM yyyy, HH:mm' }}</p>
          </div>
          <span class="status large" [attr.data-status]="order()!.orderStatus">{{ order()!.orderStatus }}</span>
        </div>

        <div class="detail-grid">
          <!-- Customer & Delivery -->
          <div class="card">
            <h3>Customer</h3>
            <p><strong>{{ order()!.customerName }}</strong></p>
            <p>{{ order()!.email }}</p>
            <p>{{ order()!.phone }}</p>
          </div>
          <div class="card">
            <h3>Delivery</h3>
            <p>{{ order()!.address }}</p>
            <p>{{ order()!.area ? order()!.area + ', ' : '' }}{{ order()!.city }}</p>
            @if (order()!.postalCode) { <p>{{ order()!.postalCode }}</p> }
            @if (order()!.deliveryInstructions) {
              <p class="muted">Note: {{ order()!.deliveryInstructions }}</p>
            }
          </div>

          <!-- Status update -->
          <div class="card status-card">
            <h3>Update Status</h3>
            <div class="status-flow">
              @for (s of statusFlow; track s) {
                <button type="button" class="flow-btn"
                        [class.current]="order()!.orderStatus === s"
                        [class.past]="isPast(s)"
                        [disabled]="order()!.orderStatus === 'Cancelled' || order()!.orderStatus === 'Delivered'"
                        (click)="updateStatus(s)">
                  {{ s }}
                </button>
              }
            </div>
            @if (order()!.orderStatus !== 'Cancelled' && order()!.orderStatus !== 'Delivered') {
              <button type="button" class="btn btn-outline btn-sm cancel-btn" (click)="updateStatus('Cancelled')">
                Cancel Order
              </button>
            }
            <div class="meta-row">
              <p><strong>Payment:</strong> {{ order()!.paymentMethod }} · {{ order()!.paymentStatus }}</p>
              <p><strong>Cancel deadline:</strong> {{ order()!.cancellationDeadline | date:'dd MMM yyyy, HH:mm' }}</p>
            </div>
          </div>

          <!-- Items -->
          <div class="card items-card">
            <h3>Items</h3>
            <div class="items">
              @for (item of order()!.items; track item.id) {
                <div class="item-row">
                  <div>
                    <p class="name">{{ item.productName }}</p>
                    <p class="meta">Rs. {{ item.unitPrice | number }} × {{ item.quantity }}</p>
                  </div>
                  <span class="sub">Rs. {{ item.subtotal | number }}</span>
                </div>
              }
            </div>
            <div class="totals">
              <div class="row"><span>Subtotal</span><span>Rs. {{ order()!.subtotal | number }}</span></div>
              <div class="row"><span>Delivery</span><span>Rs. {{ order()!.deliveryCharges | number }}</span></div>
              @if (order()!.discount > 0) {
                <div class="row"><span>Discount</span><span>− Rs. {{ order()!.discount | number }}</span></div>
              }
              <div class="row total"><span>Total</span><span>Rs. {{ order()!.total | number }}</span></div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .breadcrumb { font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 1rem; display: flex; gap: 0.5rem; }
    .breadcrumb a { color: var(--color-text-muted); }
    .detail-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap;
    }
    h1 { font-size: 1.5rem; margin-bottom: 0.2rem; }
    .muted { color: var(--color-text-muted); font-size: 0.9rem; }

    .detail-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;
    }
    .card {
      background: white; border-radius: var(--radius-lg); padding: 1.25rem;
      box-shadow: var(--shadow-card);
    }
    .card h3 { font-size: 1rem; font-family: var(--font-body); margin-bottom: 0.75rem; }
    .card p { font-size: 0.95rem; margin-bottom: 0.3rem; }

    .status-card { grid-column: 1 / -1; }
    .status-flow {
      display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;
    }
    .flow-btn {
      padding: 0.4rem 0.85rem; border-radius: var(--radius-full); border: 1.5px solid var(--color-border);
      background: white; font-size: 0.8rem; cursor: pointer; color: var(--color-text-muted);
    }
    .flow-btn.current {
      background: var(--color-primary); border-color: var(--color-primary); color: white; font-weight: 600;
    }
    .flow-btn.past { border-color: var(--color-success); color: var(--color-success); }
    .flow-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .cancel-btn { margin-bottom: 1rem; }
    .meta-row { font-size: 0.85rem; color: var(--color-text-muted); }
    .meta-row p { margin-bottom: 0.25rem; }

    .items-card { grid-column: 1 / -1; }
    .item-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.75rem 0; border-bottom: 1px solid var(--color-border);
    }
    .item-row .name { font-weight: 500; }
    .item-row .meta { font-size: 0.85rem; color: var(--color-text-muted); }
    .item-row .sub { font-weight: 500; }
    .totals { margin-top: 1rem; max-width: 280px; margin-left: auto; }
    .totals .row { display: flex; justify-content: space-between; margin-bottom: 0.4rem; font-size: 0.95rem; }
    .totals .total { font-weight: 600; font-size: 1.1rem; padding-top: 0.5rem; border-top: 1px solid var(--color-border); }

    .status {
      display: inline-block; padding: 0.25rem 0.7rem; border-radius: var(--radius-full);
      font-size: 0.8rem; font-weight: 600;
    }
    .status.large { font-size: 0.9rem; padding: 0.35rem 0.9rem; }
    .status[data-status="Pending"] { background: #fff3e0; color: #e65100; }
    .status[data-status="Confirmed"], .status[data-status="Processing"], .status[data-status="Packed"] { background: #e3f2fd; color: #1565c0; }
    .status[data-status="Shipped"], .status[data-status="OutForDelivery"] { background: #f3e5f5; color: #7b1fa2; }
    .status[data-status="Delivered"] { background: #e8f5e9; color: #2e7d32; }
    .status[data-status="Cancelled"] { background: #fce4ec; color: #c62828; }

    @media (max-width: 700px) {
      .detail-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private admin = inject(AdminService);
  private toast = inject(ToastService);

  order = signal<Order | null>(null);
  loading = signal(true);

  statusFlow: OrderStatus[] = [
    'Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'OutForDelivery', 'Delivered'
  ];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = +(params.get('id') || 0);
      this.loading.set(true);
      this.admin.getOrder(id).subscribe(o => {
        this.order.set(o);
        this.loading.set(false);
      });
    });
  }

  isPast(status: OrderStatus): boolean {
    const o = this.order();
    if (!o) return false;
    const idx = this.statusFlow.indexOf(status);
    const current = this.statusFlow.indexOf(o.orderStatus as OrderStatus);
    return current > idx;
  }

  updateStatus(status: OrderStatus): void {
    const o = this.order();
    if (!o) return;
    this.admin.updateOrderStatus(o.id, status).subscribe(() => {
      this.order.set({ ...o, orderStatus: status });
      this.toast.success(`Order status updated to ${status}`);
    });
  }
}
