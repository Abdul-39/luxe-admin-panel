import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { CouponService, Coupon } from '../../../core/services/coupon.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe, DatePipe],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1>Coupons</h1>
          <p class="muted">Create and manage discount codes</p>
        </div>
        <button type="button" class="btn btn-primary" (click)="openForm()">+ New Coupon</button>
      </div>

      @if (showForm()) {
        <div class="card form-card">
          <h3>{{ editingId() ? 'Edit Coupon' : 'Create Coupon' }}</h3>
          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Code *</label>
                <input class="form-control" formControlName="code" placeholder="WELCOME10" style="text-transform: uppercase;" />
              </div>
              <div class="form-group">
                <label class="form-label">Type *</label>
                <select class="form-control" formControlName="discountType">
                  <option value="Percentage">Percentage (%)</option>
                  <option value="Fixed">Fixed amount (Rs.)</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Discount Value *</label>
                <input type="number" class="form-control" formControlName="discountValue" min="0" />
              </div>
              <div class="form-group">
                <label class="form-label">Min Order Amount (Rs.)</label>
                <input type="number" class="form-control" formControlName="minOrderAmount" min="0" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Max Uses</label>
                <input type="number" class="form-control" formControlName="maxUses" min="1" placeholder="Unlimited" />
              </div>
              <div class="form-group">
                <label class="form-label">Expires At</label>
                <input type="date" class="form-control" formControlName="expiresAt" />
              </div>
            </div>
            <label class="check-row">
              <input type="checkbox" formControlName="isActive" />
              <span>Active</span>
            </label>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
                {{ saving() ? 'Saving...' : 'Save Coupon' }}
              </button>
              <button type="button" class="btn btn-outline" (click)="closeForm()">Cancel</button>
            </div>
          </form>
        </div>
      }

      <div class="card table-card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Usage</th>
                <th>Expires</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (c of coupons(); track c.id) {
                <tr>
                  <td><strong class="code">{{ c.code }}</strong></td>
                  <td>
                    @if (c.discountType === 'Percentage') {
                      {{ c.discountValue }}%
                    } @else {
                      Rs. {{ c.discountValue | number }}
                    }
                  </td>
                  <td>{{ c.minOrderAmount ? ('Rs. ' + (c.minOrderAmount | number)) : '—' }}</td>
                  <td>{{ c.usedCount }}{{ c.maxUses ? ' / ' + c.maxUses : '' }}</td>
                  <td>{{ c.expiresAt ? (c.expiresAt | date:'dd MMM yyyy') : 'Never' }}</td>
                  <td>
                    <button type="button" class="status-toggle" [class.off]="!c.isActive"
                            (click)="toggle(c)">
                      {{ c.isActive ? 'Active' : 'Inactive' }}
                    </button>
                  </td>
                  <td class="actions">
                    <button type="button" class="btn btn-ghost btn-sm" (click)="edit(c)">Edit</button>
                    <button type="button" class="btn btn-ghost btn-sm danger" (click)="remove(c)">Delete</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 1.25rem; gap: 1rem; flex-wrap: wrap;
    }
    h1 { font-size: 1.6rem; margin-bottom: 0.2rem; }
    .muted { color: var(--color-text-muted); font-size: 0.9rem; }

    .form-card { padding: 1.5rem; margin-bottom: 1.5rem; }
    .form-card h3 { font-size: 1.1rem; font-family: var(--font-body); margin-bottom: 1.25rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .check-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; cursor: pointer; }
    .form-actions { display: flex; gap: 0.75rem; }

    .table-card { padding: 0; overflow: hidden; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    th {
      text-align: left; padding: 0.85rem 1rem; font-size: 0.75rem; text-transform: uppercase;
      letter-spacing: 0.03em; color: var(--color-text-muted); background: var(--color-blush);
      border-bottom: 1px solid var(--color-border);
    }
    td { padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border); vertical-align: middle; }
    .code { font-family: monospace; letter-spacing: 0.04em; color: var(--color-primary-dark); }

    .status-toggle {
      border: none; padding: 0.2rem 0.6rem; border-radius: var(--radius-full);
      font-size: 0.75rem; font-weight: 600; cursor: pointer;
      background: #e8f5e9; color: #2e7d32;
    }
    .status-toggle.off { background: #f5f5f5; color: #757575; }
    .actions { white-space: nowrap; }
    .danger { color: var(--color-danger) !important; }

    @media (max-width: 700px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminCouponsComponent implements OnInit {
  private couponService = inject(CouponService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  coupons = signal<Coupon[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);

  form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    discountType: ['Percentage' as 'Percentage' | 'Fixed', Validators.required],
    discountValue: [10, [Validators.required, Validators.min(0)]],
    minOrderAmount: [null as number | null],
    maxUses: [null as number | null],
    expiresAt: [''],
    isActive: [true]
  });

  ngOnInit(): void {
    this.load();
  }

  openForm(): void {
    this.editingId.set(null);
    this.form.reset({
      code: '', discountType: 'Percentage', discountValue: 10,
      minOrderAmount: null, maxUses: null, expiresAt: '', isActive: true
    });
    this.showForm.set(true);
  }

  edit(c: Coupon): void {
    this.editingId.set(c.id);
    this.form.patchValue({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount ?? null,
      maxUses: c.maxUses ?? null,
      expiresAt: c.expiresAt ? c.expiresAt.substring(0, 10) : '',
      isActive: c.isActive
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    const payload = {
      code: v.code.trim().toUpperCase(),
      discountType: v.discountType,
      discountValue: v.discountValue,
      minOrderAmount: v.minOrderAmount,
      maxUses: v.maxUses,
      expiresAt: v.expiresAt || null,
      isActive: v.isActive
    };

    const req = this.editingId()
      ? this.couponService.update(this.editingId()!, payload)
      : this.couponService.create(payload);

    req.subscribe(() => {
      this.toast.success(this.editingId() ? 'Coupon updated' : 'Coupon created');
      this.saving.set(false);
      this.closeForm();
      this.load();
    });
  }

  toggle(c: Coupon): void {
    this.couponService.toggleActive(c.id).subscribe(() => {
      this.toast.info(`Coupon ${c.code} ${c.isActive ? 'deactivated' : 'activated'}`);
      this.load();
    });
  }

  remove(c: Coupon): void {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    this.couponService.delete(c.id).subscribe(() => {
      this.toast.success('Coupon deleted');
      this.load();
    });
  }

  private load(): void {
    this.couponService.getAll().subscribe(list => this.coupons.set(list));
  }
}
