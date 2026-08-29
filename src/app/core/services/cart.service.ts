import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Cart, CartItem } from '../models';
import { ToastService } from './toast.service';

const CART_KEY = 'ma_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  private items = signal<CartItem[]>(this.loadCart());

  readonly cartItems = this.items.asReadonly();
  readonly itemCount = computed(() => this.items().reduce((s, i) => s + i.quantity, 0));
  readonly subtotal = computed(() => this.items().reduce((s, i) => s + i.subtotal, 0));

  // These will be calculated with backend settings later
  readonly deliveryCharges = signal(200);
  readonly discount = signal(0);
  readonly freeDeliveryThreshold = signal(3000);

  readonly total = computed(() => {
    const sub = this.subtotal();
    const delivery = sub >= this.freeDeliveryThreshold() ? 0 : this.deliveryCharges();
    return Math.max(0, sub + delivery - this.discount());
  });

  readonly cart = computed<Cart>(() => ({
    items: this.items(),
    itemCount: this.itemCount(),
    subtotal: this.subtotal(),
    deliveryCharges: this.subtotal() >= this.freeDeliveryThreshold() ? 0 : this.deliveryCharges(),
    discount: this.discount(),
    total: this.total()
  }));

  addItem(product: {
    id: number;
    name: string;
    price: number;
    discountPrice?: number | null;
    stockQuantity: number;
    images: { imageUrl: string; isMain: boolean }[];
  }, quantity = 1): boolean {
    const current = this.items();
    const existing = current.find(i => i.productId === product.id);
    const unitPrice = product.discountPrice ?? product.price;
    const mainImage = product.images.find(i => i.isMain)?.imageUrl || product.images[0]?.imageUrl || '';

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stockQuantity) {
        this.toast.error(`Only ${product.stockQuantity} left in stock`);
        return false;
      }
      this.items.set(current.map(i =>
        i.productId === product.id
          ? { ...i, quantity: newQty, subtotal: newQty * unitPrice }
          : i
      ));
    } else {
      if (quantity > product.stockQuantity) {
        this.toast.error(`Only ${product.stockQuantity} left in stock`);
        return false;
      }
      this.items.set([...current, {
        productId: product.id,
        productName: product.name,
        productImage: mainImage,
        unitPrice,
        quantity,
        stockQuantity: product.stockQuantity,
        subtotal: quantity * unitPrice
      }]);
    }
    this.persist();
    this.toast.success('Product added to cart');
    return true;
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity < 1) {
      this.removeItem(productId);
      return;
    }
    const current = this.items();
    const item = current.find(i => i.productId === productId);
    if (!item) return;
    if (quantity > item.stockQuantity) {
      this.toast.error(`Only ${item.stockQuantity} left in stock`);
      return;
    }
    this.items.set(current.map(i =>
      i.productId === productId
        ? { ...i, quantity, subtotal: quantity * i.unitPrice }
        : i
    ));
    this.persist();
  }

  removeItem(productId: number): void {
    this.items.set(this.items().filter(i => i.productId !== productId));
    this.persist();
    this.toast.info('Item removed from cart');
  }

  clear(): void {
    this.items.set([]);
    this.discount.set(0);
    this.persist();
  }

  applyCoupon(code: string, discountAmount: number): void {
    this.discount.set(discountAmount);
    this.toast.success(`Coupon ${code} applied`);
  }

  private persist(): void {
    localStorage.setItem(CART_KEY, JSON.stringify(this.items()));
  }

  private loadCart(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
