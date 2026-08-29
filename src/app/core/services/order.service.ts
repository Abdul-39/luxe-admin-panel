import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderStatus } from '../models';
import { ToastService } from './toast.service';

const MOCK_CUSTOMER_ORDERS: Order[] = []; // mock cleared

@Injectable({ providedIn: 'root' })
export class OrderService {
  private toast = inject(ToastService);
  private http = inject(HttpClient);
  private useApi = false; // set true when backend is running
  private orders = signal<Order[]>([...MOCK_CUSTOMER_ORDERS]);

  getMyOrders(): Observable<Order[]> {
    return of([...this.orders()].sort((a, b) =>
      new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
    )).pipe(delay(300));
  }

  getOrder(id: number): Observable<Order | null> {
    return of(this.orders().find(o => o.id === id) || null).pipe(delay(200));
  }

  cancelOrder(id: number, reason?: string): Observable<{ success: boolean; message: string }> {
    // Prefer real API when enabled — server is the authority for 24h window & stock
    if (this.useApi) {
      return this.http.post<{ success: boolean; message: string; data?: Order }>(
        `${environment.apiUrl}/orders/${id}/cancel`,
        { reason: reason || null }
      ).pipe(
        map(res => {
          if (res.success) {
            this.orders.update(list =>
              list.map(o => o.id === id
                ? { ...o, orderStatus: 'Cancelled' as OrderStatus, canCancel: false }
                : o
              )
            );
            this.toast.success(res.message || 'Order cancelled successfully');
          } else {
            this.toast.error(res.message || 'Cancellation failed');
          }
          return { success: res.success, message: res.message };
        }),
        catchError(err => {
          const msg = err?.error?.message || 'Cancellation failed';
          this.toast.error(msg);
          return of({ success: false, message: msg });
        })
      );
    }

    // Demo / offline path — mirrors server rules
    const order = this.orders().find(o => o.id === id);
    if (!order) return of({ success: false, message: 'Order not found' }).pipe(delay(200));

    const now = Date.now();
    const deadline = new Date(order.cancellationDeadline).getTime();
    const blocked = ['Shipped', 'OutForDelivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'];

    if (now > deadline) {
      return of({ success: false, message: 'Cancellation window has expired' }).pipe(delay(200));
    }
    if (blocked.includes(order.orderStatus)) {
      return of({ success: false, message: `Order cannot be cancelled in status: ${order.orderStatus}` }).pipe(delay(200));
    }

    this.orders.update(list =>
      list.map(o => o.id === id
        ? { ...o, orderStatus: 'Cancelled' as OrderStatus, canCancel: false }
        : o
      )
    );
    this.toast.success('Order cancelled successfully');
    return of({ success: true, message: 'Order cancelled successfully' }).pipe(delay(300));
  }

  /** Returns remaining ms until cancellation deadline, or 0 if expired / not cancellable */
  getRemainingMs(order: Order): number {
    if (!order.canCancel) return 0;
    const blocked = ['Shipped', 'OutForDelivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'];
    if (blocked.includes(order.orderStatus)) return 0;
    return Math.max(0, new Date(order.cancellationDeadline).getTime() - Date.now());
  }

  formatCountdown(ms: number): string {
    if (ms <= 0) return '';
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }
}
