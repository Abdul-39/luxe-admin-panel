import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models';
import { ToastService } from './toast.service';
import { inject } from '@angular/core';

const KEY = 'ma_wishlist';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private toast = inject(ToastService);
  private items = signal<Product[]>(this.load());

  readonly list = this.items.asReadonly();
  readonly count = computed(() => this.items().length);

  isInWishlist(productId: number): boolean {
    return this.items().some(p => p.id === productId);
  }

  toggle(product: Product): void {
    if (this.isInWishlist(product.id)) {
      this.remove(product.id);
    } else {
      this.items.update(list => [...list, product]);
      this.persist();
      this.toast.success('Added to wishlist');
    }
  }

  remove(productId: number): void {
    this.items.update(list => list.filter(p => p.id !== productId));
    this.persist();
    this.toast.info('Removed from wishlist');
  }

  clear(): void {
    this.items.set([]);
    this.persist();
  }

  private persist(): void {
    localStorage.setItem(KEY, JSON.stringify(this.items()));
  }

  private load(): Product[] {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
