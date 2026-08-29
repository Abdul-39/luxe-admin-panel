import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ReasonStat {
  reason: string;
  count: number;
  totalValue: number;
  percentOfCancellations: number;
}

interface TrendPoint {
  date: string;
  count: number;
  value: number;
}

/** Demo analytics data mirroring the backend CancellationAnalyticsDto shape */
const DEMO: {
  totalCancellations: number;
  totalCancelledValue: number;
  cancellationRatePercent: number;
  totalOrdersInRange: number;
  byReason: ReasonStat[];
  byActor: { cancelledBy: string; count: number; totalValue: number }[];
  dailyTrend: TrendPoint[];
  topReason: string;
} = {
  totalCancellations: 18,
  totalCancelledValue: 52400,
  cancellationRatePercent: 8.2,
  totalOrdersInRange: 220,
  topReason: 'Changed mind',
  byReason: [
    { reason: 'Changed mind', count: 7, totalValue: 18200, percentOfCancellations: 38.9 },
    { reason: 'Found better price', count: 4, totalValue: 15600, percentOfCancellations: 22.2 },
    { reason: 'Ordered by mistake', count: 3, totalValue: 8900, percentOfCancellations: 16.7 },
    { reason: 'Delivery too slow', count: 2, totalValue: 5400, percentOfCancellations: 11.1 },
    { reason: 'Wrong item / details', count: 1, totalValue: 2800, percentOfCancellations: 5.6 },
    { reason: 'Other', count: 1, totalValue: 1500, percentOfCancellations: 5.6 }
  ],
  byActor: [
    { cancelledBy: 'Customer', count: 15, totalValue: 44800 },
    { cancelledBy: 'Admin', count: 3, totalValue: 7600 }
  ],
  dailyTrend: [
    { date: '2026-08-06', count: 2, value: 4200 },
    { date: '2026-08-07', count: 1, value: 1899 },
    { date: '2026-08-08', count: 3, value: 9100 },
    { date: '2026-08-09', count: 2, value: 5600 },
    { date: '2026-08-10', count: 4, value: 12400 },
    { date: '2026-08-11', count: 3, value: 9800 },
    { date: '2026-08-12', count: 3, value: 9401 }
  ]
};

@Component({
  selector: 'app-admin-cancellation-analytics',
  standalone: true,
  imports: [DecimalPipe, FormsModule],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1>Cancellation Analytics</h1>
          <p class="muted">Reasons, trends, and revenue impact (last 30 days demo data)</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <p class="label">Cancellations</p>
          <p class="value">{{ data.totalCancellations }}</p>
          <p class="sub">of {{ data.totalOrdersInRange }} orders</p>
        </div>
        <div class="stat-card">
          <p class="label">Cancel rate</p>
          <p class="value">{{ data.cancellationRatePercent }}%</p>
        </div>
        <div class="stat-card">
          <p class="label">Lost value</p>
          <p class="value">Rs. {{ data.totalCancelledValue | number }}</p>
        </div>
        <div class="stat-card">
          <p class="label">Top reason</p>
          <p class="value small">{{ data.topReason }}</p>
        </div>
      </div>

      <div class="row">
        <div class="card">
          <h3>By reason</h3>
          <div class="reason-list">
            @for (r of data.byReason; track r.reason) {
              <div class="reason-row">
                <div class="reason-meta">
                  <span class="reason-name">{{ r.reason }}</span>
                  <span class="reason-count">{{ r.count }} · Rs. {{ r.totalValue | number }}</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill" [style.width.%]="r.percentOfCancellations"></div>
                </div>
                <span class="pct">{{ r.percentOfCancellations }}%</span>
              </div>
            }
          </div>
        </div>

        <div class="card">
          <h3>By actor</h3>
          @for (a of data.byActor; track a.cancelledBy) {
            <div class="actor-row">
              <span class="actor-name">{{ a.cancelledBy }}</span>
              <span>{{ a.count }} cancels</span>
              <span>Rs. {{ a.totalValue | number }}</span>
            </div>
          }

          <h3 style="margin-top: 1.75rem;">Daily trend</h3>
          <div class="trend">
            @for (t of data.dailyTrend; track t.date) {
              <div class="trend-col">
                <div class="trend-bar" [style.height.px]="barH(t.count)"></div>
                <span class="trend-label">{{ t.date.slice(8) }}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <p class="api-hint">
        Live data: <code>GET /api/analytics/cancellations?from=&amp;to=</code>
        · Email queue health: <code>GET /api/analytics/email-outbox</code>
      </p>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1.5rem; }
    h1 { font-size: 1.6rem; margin-bottom: 0.2rem; }
    .muted { color: var(--color-text-muted); font-size: 0.9rem; }

    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      background: white; border-radius: var(--radius-lg); padding: 1.1rem 1.2rem;
      box-shadow: var(--shadow-card);
    }
    .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.03em; color: var(--color-text-muted); margin-bottom: 0.3rem; }
    .value { font-size: 1.4rem; font-weight: 600; }
    .value.small { font-size: 1.05rem; }
    .sub { font-size: 0.8rem; color: var(--color-text-muted); }

    .row { display: grid; grid-template-columns: 1.3fr 1fr; gap: 1.25rem; }
    .card { background: white; border-radius: var(--radius-lg); padding: 1.25rem; box-shadow: var(--shadow-card); }
    .card h3 { font-size: 1.05rem; font-family: var(--font-body); margin-bottom: 1rem; }

    .reason-row {
      display: grid; grid-template-columns: 1fr 120px 48px; gap: 0.75rem; align-items: center;
      margin-bottom: 0.85rem;
    }
    .reason-name { font-weight: 500; font-size: 0.9rem; display: block; }
    .reason-count { font-size: 0.8rem; color: var(--color-text-muted); }
    .bar-track { height: 8px; background: var(--color-blush); border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; background: linear-gradient(90deg, var(--color-primary), var(--color-primary-dark)); border-radius: 4px; }
    .pct { font-size: 0.8rem; font-weight: 600; text-align: right; color: var(--color-text-muted); }

    .actor-row {
      display: flex; justify-content: space-between; padding: 0.6rem 0;
      border-bottom: 1px solid var(--color-border); font-size: 0.95rem;
    }
    .actor-name { font-weight: 500; }

    .trend { display: flex; align-items: flex-end; gap: 0.5rem; height: 120px; margin-top: 0.5rem; }
    .trend-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; }
    .trend-bar {
      width: 100%; max-width: 28px; background: var(--color-primary); border-radius: 4px 4px 0 0;
      min-height: 4px;
    }
    .trend-label { font-size: 0.7rem; color: var(--color-text-muted); margin-top: 0.3rem; }

    .api-hint {
      margin-top: 1.5rem; font-size: 0.85rem; color: var(--color-text-muted);
    }
    .api-hint code {
      background: var(--color-blush); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.8rem;
    }

    @media (max-width: 800px) {
      .row { grid-template-columns: 1fr; }
      .reason-row { grid-template-columns: 1fr; gap: 0.35rem; }
    }
  `]
})
export class AdminCancellationAnalyticsComponent implements OnInit {
  data = DEMO;
  private maxTrend = 1;

  ngOnInit(): void {
    this.maxTrend = Math.max(...this.data.dailyTrend.map(t => t.count), 1);
  }

  barH(count: number): number {
    return Math.max(4, (count / this.maxTrend) * 100);
  }
}
