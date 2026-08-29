import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface Coupon {
  id: number;
  code: string;
  discountType: 'Percentage' | 'Fixed';
  discountValue: number;
  minOrderAmount?: number | null;
  maxUses?: number | null;
  usedCount: number;
  expiresAt?: string | null;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class CouponService {
  private nextId = 3;
  private coupons = signal<Coupon[]>([
    {
      id: 1, code: 'WELCOME10', discountType: 'Percentage', discountValue: 10,
      minOrderAmount: 1000, maxUses: 500, usedCount: 42, expiresAt: '2026-12-31', isActive: true
    },
    {
      id: 2, code: 'FLAT500', discountType: 'Fixed', discountValue: 500,
      minOrderAmount: 3000, maxUses: 100, usedCount: 18, expiresAt: '2026-09-30', isActive: true
    }
  ]);

  getAll(): Observable<Coupon[]> {
    return of([...this.coupons()]).pipe(delay(200));
  }

  create(data: Omit<Coupon, 'id' | 'usedCount'>): Observable<Coupon> {
    const coupon: Coupon = { ...data, id: this.nextId++, usedCount: 0, code: data.code.toUpperCase() };
    this.coupons.update(list => [...list, coupon]);
    return of(coupon).pipe(delay(250));
  }

  update(id: number, data: Partial<Coupon>): Observable<Coupon | null> {
    let updated: Coupon | null = null;
    this.coupons.update(list =>
      list.map(c => {
        if (c.id !== id) return c;
        updated = { ...c, ...data, code: (data.code ?? c.code).toUpperCase() };
        return updated;
      })
    );
    return of(updated).pipe(delay(250));
  }

  delete(id: number): Observable<boolean> {
    this.coupons.update(list => list.filter(c => c.id !== id));
    return of(true).pipe(delay(200));
  }

  toggleActive(id: number): Observable<boolean> {
    this.coupons.update(list =>
      list.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c)
    );
    return of(true).pipe(delay(150));
  }
}
