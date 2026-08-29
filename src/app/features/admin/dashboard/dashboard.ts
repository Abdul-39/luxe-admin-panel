import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { AdminService, DashboardStats, SalesPoint } from '../../../core/services/admin.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe],
  template: `
    <div class="dash page-enter">
      <div class="dash-header">
        <h1>Dashboard</h1>
        <p class="muted">Welcome back. Here’s what’s happening today.</p>
      </div>

      @if (loading()) {
        <div class="stats-grid">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="skeleton" style="height: 110px; border-radius: var(--radius-lg);"></div>
          }
        </div>
      } @else if (stats(); as s) {
        <div class="stats-grid">
          <div class="stat-card">
            <p class="stat-label">Total Sales</p>
            <p class="stat-value">Rs. {{ s.totalSales | number }}</p>
            <p class="stat-sub">Today: Rs. {{ s.todaySales | number }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-label">Total Orders</p>
            <p class="stat-value">{{ s.totalOrders }}</p>
            <p class="stat-sub">{{ s.pendingOrders }} pending</p>
          </div>
          <div class="stat-card">
            <p class="stat-label">Delivered</p>
            <p class="stat-value">{{ s.deliveredOrders }}</p>
            <p class="stat-sub">Avg order: Rs. {{ s.averageOrderValue | number }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-label">Customers</p>
            <p class="stat-value">{{ s.totalCustomers }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-label">Products</p>
            <p class="stat-value">{{ s.totalProducts }}</p>
          </div>
          <div class="stat-card alert">
            <p class="stat-label">Low Stock</p>
            <p class="stat-value">{{ s.lowStockProducts }}</p>
            <a routerLink="/inventory" class="stat-link">View inventory →</a>
          </div>
        </div>
      }

      
      @if (inboxCount() > 0) {
        <div class="card inbox-banner" style="margin-bottom: 1.25rem; padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; border-left: 3px solid var(--color-primary, #e11d48);">
          <div>
            <strong>{{ inboxCount() }} new contact message{{ inboxCount() > 1 ? 's' : '' }}</strong>
            <p style="margin: 0.25rem 0 0; color: var(--color-text-muted, #6b7280); font-size: 0.9rem;">From the store Contact form</p>
          </div>
          <a routerLink="/messages" class="btn btn-primary btn-sm">Open inbox</a>
        </div>
      }

      <div class="charts-row">
        <div class="card chart-card">
          <h3>Sales this week</h3>
          <div class="bar-chart">
            @for (p of sales(); track p.label) {
              <div class="bar-col">
                <div class="bar" [style.height.%]="barHeight(p.value)"></div>
                <span class="bar-label">{{ p.label }}</span>
                <span class="bar-val">{{ (p.value / 1000) | number:'1.0-1' }}k</span>
              </div>
            }
          </div>
        </div>

        <div class="card chart-card">
          <h3>Best sellers</h3>
          <div class="best-list">
            @for (b of bestSellers(); track b.name; let i = $index) {
              <div class="best-item">
                <span class="rank">{{ i + 1 }}</span>
                <div class="best-info">
                  <p class="name">{{ b.name }}</p>
                  <p class="meta">{{ b.sold }} sold · Rs. {{ b.revenue | number }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="bottom-row">
        <div class="card">
          <div class="card-header">
            <h3>Recent Orders</h3>
            <a routerLink="/orders">View all →</a>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                @for (o of recentOrders(); track o.id) {
                  <tr>
                    <td><a [routerLink]="['/orders', o.id]">{{ o.orderNumber }}</a></td>
                    <td>{{ o.customerName }}</td>
                    <td>Rs. {{ o.total | number }}</td>
                    <td><span class="status" [attr.data-status]="o.orderStatus">{{ o.orderStatus }}</span></td>
                    <td>{{ o.orderDate | date:'dd MMM yyyy' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>⚠ Low Stock</h3>
            <a routerLink="/inventory">Manage →</a>
          </div>
          <div class="low-list">
            @for (p of lowStock(); track p.id) {
              <div class="low-item">
                <div>
                  <p class="name">{{ p.name }}</p>
                  <p class="meta">Threshold: {{ p.threshold }}</p>
                </div>
                <span class="stock-badge" [class.out]="p.stock === 0">{{ p.stock }} left</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dash-header { margin-bottom: 1.5rem; }
    h1 { font-size: 1.6rem; margin-bottom: 0.25rem; }
    .muted { color: var(--color-text-muted); font-size: 0.95rem; }

    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      background: white; border-radius: var(--radius-lg); padding: 1.2rem 1.25rem;
      box-shadow: var(--shadow-card);
    }
    .stat-card.alert { border-left: 3px solid var(--color-warning); }
    .stat-label { font-size: 0.8rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 0.35rem; }
    .stat-value { font-size: 1.45rem; font-weight: 600; margin-bottom: 0.2rem; }
    .stat-sub { font-size: 0.8rem; color: var(--color-text-muted); }
    .stat-link { font-size: 0.8rem; color: var(--color-primary-dark); }

    .charts-row {
      display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem;
    }
    .chart-card { padding: 1.25rem; }
    .chart-card h3 { font-size: 1.05rem; font-family: var(--font-body); margin-bottom: 1.25rem; }

    .bar-chart {
      display: flex; align-items: flex-end; gap: 0.75rem; height: 180px; padding-top: 1rem;
    }
    .bar-col {
      flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%;
      justify-content: flex-end; position: relative;
    }
    .bar {
      width: 100%; max-width: 36px; background: linear-gradient(180deg, var(--color-primary), var(--color-primary-dark));
      border-radius: 6px 6px 2px 2px; min-height: 4px; transition: height 0.4s ease;
    }
    .bar-label { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.4rem; }
    .bar-val { font-size: 0.7rem; color: var(--color-text-muted); position: absolute; top: 0; }

    .best-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .best-item { display: flex; gap: 0.75rem; align-items: center; }
    .rank {
      width: 28px; height: 28px; border-radius: 50%; background: var(--color-blush);
      display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600;
      color: var(--color-primary-dark);
    }
    .best-info .name { font-size: 0.9rem; font-weight: 500; }
    .best-info .meta { font-size: 0.8rem; color: var(--color-text-muted); }

    .bottom-row {
      display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.25rem;
    }
    .card { background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-card); padding: 1.25rem; }
    .card-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;
    }
    .card-header h3 { font-size: 1.05rem; font-family: var(--font-body); }
    .card-header a { font-size: 0.85rem; }

    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    th {
      text-align: left; padding: 0.6rem 0.5rem; font-size: 0.75rem; text-transform: uppercase;
      letter-spacing: 0.03em; color: var(--color-text-muted); border-bottom: 1px solid var(--color-border);
    }
    td { padding: 0.75rem 0.5rem; border-bottom: 1px solid var(--color-border); }
    td a { color: var(--color-primary-dark); font-weight: 500; }

    .status {
      display: inline-block; padding: 0.2rem 0.55rem; border-radius: var(--radius-full);
      font-size: 0.75rem; font-weight: 600;
    }
    .status[data-status="Pending"] { background: #fff3e0; color: #e65100; }
    .status[data-status="Confirmed"], .status[data-status="Processing"], .status[data-status="Packed"] { background: #e3f2fd; color: #1565c0; }
    .status[data-status="Shipped"], .status[data-status="OutForDelivery"] { background: #f3e5f5; color: #7b1fa2; }
    .status[data-status="Delivered"] { background: #e8f5e9; color: #2e7d32; }
    .status[data-status="Cancelled"] { background: #fce4ec; color: #c62828; }

    .low-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .low-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.6rem 0; border-bottom: 1px solid var(--color-border);
    }
    .low-item .name { font-size: 0.9rem; font-weight: 500; }
    .low-item .meta { font-size: 0.8rem; color: var(--color-text-muted); }
    .stock-badge {
      font-size: 0.8rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: var(--radius-full);
      background: #fff3e0; color: #e65100;
    }
    .stock-badge.out { background: #fce4ec; color: #c62828; }

    @media (max-width: 900px) {
      .charts-row, .bottom-row { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private admin = inject(AdminService);
  private productService = inject(ProductService);

  stats = signal<DashboardStats | null>(null);
  lowStockList = signal<{ id: number; name: string; stock: number; threshold: number }[]>([]);
  inboxCount = signal(0);
  sales = signal<SalesPoint[]>([]);
  bestSellers = signal<{ name: string; sold: number; revenue: number }[]>([]);
  recentOrders = signal<Order[]>([]);
  lowStock = signal<{ id: number; name: string; stock: number; threshold: number }[]>([]);
  loading = signal(true);

  private maxSales = 1;

  ngOnInit(): void {
    this.admin.getDashboardStats().subscribe(s => {
      this.stats.set(s);
      this.loading.set(false);
    });
    this.admin.getSalesOverTime().subscribe(s => {
      this.sales.set(s);
      this.maxSales = Math.max(...s.map(x => x.value), 1);
    });
    this.admin.getBestSellers().subscribe(b => this.bestSellers.set(b));
    this.admin.getOrders().subscribe(o => this.recentOrders.set(o.slice(0, 5)));
    // Prefer live product stock from catalog (includes admin uploads)
    this.productService.getProducts({ pageSize: 200 }).subscribe(res => {
      const low = res.items
        .filter(p => p.stockQuantity <= p.lowStockThreshold)
        .map(p => ({ id: p.id, name: p.name, stock: p.stockQuantity, threshold: p.lowStockThreshold }))
        .sort((a, b) => a.stock - b.stock);
      if (low.length) {
        this.lowStock.set(low);
      } else {
        this.admin.getLowStockProducts().subscribe(p => this.lowStock.set(p));
      }
    });
    try {
      const msgs = JSON.parse(localStorage.getItem('luxe_contact_messages') || '[]');
      this.inboxCount.set(Array.isArray(msgs) ? msgs.filter((m: { read?: boolean }) => !m.read).length : 0);
    } catch {
      this.inboxCount.set(0);
    }
  }

  barHeight(value: number): number {
    return Math.max(4, (value / this.maxSales) * 100);
  }
}
