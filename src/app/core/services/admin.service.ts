import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Product, Category, Order, OrderStatus } from '../models';
import { ToastService } from './toast.service';

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  todaySales: number;
  averageOrderValue: number;
}

export interface SalesPoint {
  label: string;
  value: number;
}

export interface AdminOrder extends Order {
  // already has everything needed
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  private orders = signal<Order[]>([]);

  // ============================================================
  // ORDERS
  // ============================================================

  /**
   * Get ALL orders from backend.
   * Admin JWT is automatically added by authInterceptor.
   */
  getOrders(status?: string): Observable<Order[]> {
    let url = `${environment.apiUrl}/orders`;

    if (status && status !== 'all') {
      url += `?status=${encodeURIComponent(status)}`;
    }

    return this.http
      .get<ApiEnvelope<Order[]> | Order[]>(url)
      .pipe(
        map(res => {
          const orders = this.unwrapList(res);

          this.orders.set(
            [...orders].sort(
              (a, b) =>
                new Date(b.orderDate).getTime() -
                new Date(a.orderDate).getTime()
            )
          );

          return this.orders();
        }),
        catchError(err => {
          console.error('Failed to load admin orders:', err);

          const message =
            err?.error?.message ||
            err?.error?.title ||
            'Failed to load orders from server';

          this.toast.error(message);

          this.orders.set([]);

          return of([]);
        })
      );
  }

  /**
   * Get one order by ID.
   * Backend allows Admin or the owning Customer.
   */
  getOrder(id: number): Observable<Order | null> {
    return this.http
      .get<ApiEnvelope<Order> | Order>(
        `${environment.apiUrl}/orders/${id}`
      )
      .pipe(
        map(res => this.unwrapOne(res)),
        catchError(err => {
          console.error(`Failed to load order ${id}:`, err);

          if (err?.status === 404) {
            this.toast.error('Order not found');
          } else {
            this.toast.error(
              err?.error?.message || 'Failed to load order'
            );
          }

          return of(null);
        })
      );
  }

  /**
   * Update order status.
   */
  updateOrderStatus(
    id: number,
    status: OrderStatus,
    paymentStatus?: string
  ): Observable<boolean> {
    const body: {
      orderStatus: OrderStatus;
      paymentStatus?: string;
    } = {
      orderStatus: status
    };

    if (paymentStatus) {
      body.paymentStatus = paymentStatus;
    }

    return this.http
      .patch<ApiEnvelope<Order> | Order>(
        `${environment.apiUrl}/orders/${id}/status`,
        body
      )
      .pipe(
        map(res => {
          const updatedOrder = this.unwrapOne(res);

          if (updatedOrder) {
            this.orders.update(list =>
              list.map(order =>
                order.id === id ? updatedOrder : order
              )
            );
          }

          this.toast.success('Order status updated successfully');

          return true;
        }),
        catchError(err => {
          console.error(
            `Failed to update order ${id} status:`,
            err
          );

          const message =
            err?.error?.message ||
            err?.error?.title ||
            'Failed to update order status';

          this.toast.error(message);

          return of(false);
        })
      );
  }

  // ============================================================
  // DASHBOARD
  // ============================================================

  /**
   * Dashboard statistics are calculated from real backend orders.
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.getOrders().pipe(
      map(list => {
        const delivered = list.filter(
          o => o.orderStatus === 'Delivered'
        );

        const pending = list.filter(o =>
          [
            'Pending',
            'Confirmed',
            'Processing',
            'Packed'
          ].includes(o.orderStatus)
        );

        const nonCancelled = list.filter(
          o => o.orderStatus !== 'Cancelled'
        );

        const totalSales = nonCancelled.reduce(
          (sum, o) => sum + Number(o.total || 0),
          0
        );

        const today = new Date();

        const todaySales = nonCancelled
          .filter(o => {
            const orderDate = new Date(o.orderDate);

            return (
              orderDate.getFullYear() === today.getFullYear() &&
              orderDate.getMonth() === today.getMonth() &&
              orderDate.getDate() === today.getDate()
            );
          })
          .reduce(
            (sum, o) => sum + Number(o.total || 0),
            0
          );

        const averageOrderValue =
          nonCancelled.length > 0
            ? Math.round(totalSales / nonCancelled.length)
            : 0;

        return {
          totalSales,
          totalOrders: list.length,
          pendingOrders: pending.length,
          deliveredOrders: delivered.length,

          // These two remain as your current dashboard values
          // until customer/product admin endpoints are connected.
          totalCustomers: 48,
          totalProducts: 86,

          lowStockProducts: 5,

          todaySales,

          averageOrderValue
        };
      }),
      catchError(err => {
        console.error(
          'Failed to load dashboard statistics:',
          err
        );

        return of({
          totalSales: 0,
          totalOrders: 0,
          pendingOrders: 0,
          deliveredOrders: 0,
          totalCustomers: 0,
          totalProducts: 0,
          lowStockProducts: 0,
          todaySales: 0,
          averageOrderValue: 0
        });
      })
    );
  }

  // ============================================================
  // SALES
  // ============================================================

  /**
   * Creates sales data from real orders.
   *
   * Last 7 days are shown.
   */
  getSalesOverTime(): Observable<SalesPoint[]> {
    return this.getOrders().pipe(
      map(orders => {
        const result: SalesPoint[] = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setHours(0, 0, 0, 0);
          date.setDate(date.getDate() - i);

          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

          const value = orders
            .filter(order => {
              const orderDate = new Date(order.orderDate);

              return (
                orderDate >= date &&
                orderDate < nextDate &&
                order.orderStatus !== 'Cancelled'
              );
            })
            .reduce(
              (sum, order) =>
                sum + Number(order.total || 0),
              0
            );

          result.push({
            label: date.toLocaleDateString('en-US', {
              weekday: 'short'
            }),
            value
          });
        }

        return result;
      }),
      catchError(err => {
        console.error(
          'Failed to calculate sales over time:',
          err
        );

        return of([
          { label: 'Mon', value: 0 },
          { label: 'Tue', value: 0 },
          { label: 'Wed', value: 0 },
          { label: 'Thu', value: 0 },
          { label: 'Fri', value: 0 },
          { label: 'Sat', value: 0 },
          { label: 'Sun', value: 0 }
        ]);
      })
    );
  }

  // ============================================================
  // LOW STOCK
  // ============================================================

  getLowStockProducts(): Observable<
    {
      id: number;
      name: string;
      stock: number;
      threshold: number;
    }[]
  > {
    // Keep existing dashboard mock values for now.
    return of([
      {
        id: 5,
        name: 'Slim Power Bank 10000mAh',
        stock: 3,
        threshold: 5
      },
      {
        id: 7,
        name: 'Adjustable Phone Stand',
        stock: 0,
        threshold: 8
      },
      {
        id: 12,
        name: 'Car Phone Mount',
        stock: 2,
        threshold: 5
      },
      {
        id: 18,
        name: 'Lightning Cable 1m',
        stock: 4,
        threshold: 10
      },
      {
        id: 22,
        name: 'Silicone Case - Pink',
        stock: 1,
        threshold: 5
      }
    ]);
  }

  // ============================================================
  // BEST SELLERS
  // ============================================================

  getBestSellers(): Observable<
    {
      name: string;
      sold: number;
      revenue: number;
    }[]
  > {
    // Keep existing values until a backend best-sellers
    // endpoint is available.
    return of([
      {
        name: 'Wireless Earbuds Pro',
        sold: 142,
        revenue: 993458
      },
      {
        name: 'Crystal Clear iPhone 15 Case',
        sold: 98,
        revenue: 186102
      },
      {
        name: 'Rose Gold MagSafe Charger',
        sold: 76,
        revenue: 303924
      },
      {
        name: '9H Tempered Glass Protector',
        sold: 210,
        revenue: 125790
      },
      {
        name: 'Slim Power Bank 10000mAh',
        sold: 64,
        revenue: 179136
      }
    ]);
  }

  // ============================================================
  // RESPONSE HELPERS
  // ============================================================

  private unwrapList(
    res: ApiEnvelope<Order[]> | Order[]
  ): Order[] {
    if (
      res &&
      typeof res === 'object' &&
      'data' in res &&
      Array.isArray((res as ApiEnvelope<Order[]>).data)
    ) {
      return (res as ApiEnvelope<Order[]>).data!;
    }

    if (Array.isArray(res)) {
      return res;
    }

    throw new Error('Unexpected orders API response shape');
  }

  private unwrapOne(
    res: ApiEnvelope<Order> | Order
  ): Order | null {
    if (
      res &&
      typeof res === 'object' &&
      'data' in res
    ) {
      return (res as ApiEnvelope<Order>).data ?? null;
    }

    if (
      res &&
      typeof res === 'object' &&
      'id' in res
    ) {
      return res as Order;
    }

    return null;
  }
}