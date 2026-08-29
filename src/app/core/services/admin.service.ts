import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Product, Category, Order, OrderStatus } from '../models';

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

// Mock admin data
const MOCK_ORDERS: Order[] = []; // mock cleared — wire to API

@Injectable({ providedIn: 'root' })
export class AdminService {
  private orders = signal<Order[]>([...MOCK_ORDERS]);

  getDashboardStats(): Observable<DashboardStats> {
    const list = this.orders();
    const delivered = list.filter(o => o.orderStatus === 'Delivered');
    const pending = list.filter(o => ['Pending', 'Confirmed', 'Processing', 'Packed'].includes(o.orderStatus));
    const totalSales = list.filter(o => o.orderStatus !== 'Cancelled').reduce((s, o) => s + o.total, 0);
    return of({
      totalSales,
      totalOrders: list.length,
      pendingOrders: pending.length,
      deliveredOrders: delivered.length,
      totalCustomers: 48,
      totalProducts: 86,
      lowStockProducts: 5,
      todaySales: 8898,
      averageOrderValue: list.length ? Math.round(totalSales / list.filter(o => o.orderStatus !== 'Cancelled').length) : 0
    }).pipe(delay(350));
  }

  getSalesOverTime(): Observable<SalesPoint[]> {
    return of([
      { label: 'Mon', value: 12400 },
      { label: 'Tue', value: 9800 },
      { label: 'Wed', value: 15200 },
      { label: 'Thu', value: 11100 },
      { label: 'Fri', value: 18900 },
      { label: 'Sat', value: 22100 },
      { label: 'Sun', value: 8900 }
    ]).pipe(delay(200));
  }

  getOrders(status?: string): Observable<Order[]> {
    let list = this.orders();
    if (status && status !== 'all') {
      list = list.filter(o => o.orderStatus === status);
    }
    return of([...list].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())).pipe(delay(300));
  }

  getOrder(id: number): Observable<Order | null> {
    return of(this.orders().find(o => o.id === id) || null).pipe(delay(200));
  }

  updateOrderStatus(id: number, status: OrderStatus): Observable<boolean> {
    this.orders.update(list =>
      list.map(o => o.id === id ? { ...o, orderStatus: status, canCancel: !['Shipped', 'OutForDelivery', 'Delivered', 'Cancelled'].includes(status) } : o)
    );
    return of(true).pipe(delay(250));
  }

  getLowStockProducts(): Observable<{ id: number; name: string; stock: number; threshold: number }[]> {
    return of([
      { id: 5, name: 'Slim Power Bank 10000mAh', stock: 3, threshold: 5 },
      { id: 7, name: 'Adjustable Phone Stand', stock: 0, threshold: 8 },
      { id: 12, name: 'Car Phone Mount', stock: 2, threshold: 5 },
      { id: 18, name: 'Lightning Cable 1m', stock: 4, threshold: 10 },
      { id: 22, name: 'Silicone Case - Pink', stock: 1, threshold: 5 }
    ]).pipe(delay(200));
  }

  getBestSellers(): Observable<{ name: string; sold: number; revenue: number }[]> {
    return of([
      { name: 'Wireless Earbuds Pro', sold: 142, revenue: 993458 },
      { name: 'Crystal Clear iPhone 15 Case', sold: 98, revenue: 186102 },
      { name: 'Rose Gold MagSafe Charger', sold: 76, revenue: 303924 },
      { name: '9H Tempered Glass Protector', sold: 210, revenue: 125790 },
      { name: 'Slim Power Bank 10000mAh', sold: 64, revenue: 179136 }
    ]).pipe(delay(200));
  }
}
