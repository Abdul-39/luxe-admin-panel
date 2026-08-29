import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { NavbarComponent } from '../../layout/navbar/navbar';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, DecimalPipe, NavbarComponent],
  template: `
    <app-navbar />
    <main class="page-enter">
      <div class="container">
        <nav class="breadcrumb">
          <a routerLink="/">Home</a>
          <span>/</span>
          <span>Cart</span>
        </nav>
        <h1>Shopping Cart</h1>

        @if (cart.itemCount() === 0) {
          <div class="empty-state">
            <div class="icon">🛒</div>
            <h3>Your cart is feeling a little empty</h3>
            <p>Discover beautiful accessories and add them to your cart.</p>
            <a routerLink="/shop" class="btn btn-primary">Start Shopping</a>
          </div>
        } @else {
          <div class="cart-layout">
            <div class="cart-items">
              @for (item of cart.cartItems(); track item.productId) {
                <article class="cart-item card">
                  <a [routerLink]="['/products']" class="item-image">
                    <img [src]="item.productImage" [alt]="item.productName" />
                  </a>
                  <div class="item-info">
                    <h3>{{ item.productName }}</h3>
                    <p class="unit-price">Rs. {{ item.unitPrice | number }} each</p>
                    @if (item.quantity >= item.stockQuantity) {
                      <p class="stock-warn">Only {{ item.stockQuantity }} left in stock</p>
                    }
                    <div class="item-actions">
                      <div class="qty-control">
                        <button type="button" (click)="cart.updateQuantity(item.productId, item.quantity - 1)">−</button>
                        <span>{{ item.quantity }}</span>
                        <button type="button" (click)="cart.updateQuantity(item.productId, item.quantity + 1)"
                                [disabled]="item.quantity >= item.stockQuantity">+</button>
                      </div>
                      <button type="button" class="remove-btn" (click)="cart.removeItem(item.productId)">Remove</button>
                    </div>
                  </div>
                  <div class="item-subtotal">
                    Rs. {{ item.subtotal | number }}
                  </div>
                </article>
              }
            </div>

            <aside class="summary card">
              <h2>Order Summary</h2>
              <div class="summary-row">
                <span>Subtotal</span>
                <span>Rs. {{ cart.subtotal() | number }}</span>
              </div>
              <div class="summary-row">
                <span>Delivery</span>
                <span>
                  @if (cart.subtotal() >= cart.freeDeliveryThreshold()) {
                    <span class="free">Free</span>
                  } @else {
                    Rs. {{ cart.deliveryCharges() | number }}
                  }
                </span>
              </div>
              @if (cart.discount() > 0) {
                <div class="summary-row discount">
                  <span>Discount</span>
                  <span>− Rs. {{ cart.discount() | number }}</span>
                </div>
              }
              <div class="summary-row total">
                <span>Total</span>
                <span>Rs. {{ cart.total() | number }}</span>
              </div>
              @if (cart.subtotal() < cart.freeDeliveryThreshold()) {
                <p class="free-hint">
                  Add Rs. {{ (cart.freeDeliveryThreshold() - cart.subtotal()) | number }} more for free delivery
                </p>
              }
              <a routerLink="/checkout" class="btn btn-primary btn-lg checkout-btn">Proceed to Checkout</a>
              <a routerLink="/shop" class="btn btn-ghost continue-btn">Continue Shopping</a>
            </aside>
          </div>
        }
      </div>
    </main>
  `,
  styles: [`
    .breadcrumb { font-size: 0.85rem; color: var(--color-text-muted); padding: 1.5rem 0 0.5rem; display: flex; gap: 0.5rem; }
    .breadcrumb a { color: var(--color-text-muted); }
    h1 { font-size: 1.9rem; margin-bottom: 2rem; }

    .cart-layout {
      display: grid; grid-template-columns: 1fr 340px; gap: 2rem; padding-bottom: 4rem; align-items: start;
    }

    .cart-item {
      display: grid; grid-template-columns: 100px 1fr auto; gap: 1.25rem;
      padding: 1.25rem; margin-bottom: 1rem; align-items: center;
    }
    .item-image {
      width: 100px; height: 100px; border-radius: var(--radius-md); overflow: hidden;
      background: var(--color-blush);
    }
    .item-image img { width: 100%; height: 100%; object-fit: cover; }
    .item-info h3 { font-size: 1rem; font-family: var(--font-body); font-weight: 500; margin-bottom: 0.3rem; }
    .unit-price { font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 0.4rem; }
    .stock-warn { font-size: 0.8rem; color: var(--color-warning); margin-bottom: 0.5rem; }
    .item-actions { display: flex; align-items: center; gap: 1rem; }
    .qty-control {
      display: inline-flex; align-items: center; border: 1.5px solid var(--color-border);
      border-radius: var(--radius-sm); overflow: hidden;
    }
    .qty-control button {
      width: 32px; height: 32px; border: none; background: var(--color-blush);
      cursor: pointer; font-size: 1rem;
    }
    .qty-control button:disabled { opacity: 0.4; }
    .qty-control span { width: 36px; text-align: center; font-size: 0.95rem; }
    .remove-btn {
      border: none; background: none; color: var(--color-text-muted); font-size: 0.85rem;
      cursor: pointer; text-decoration: underline;
    }
    .remove-btn:hover { color: var(--color-danger); }
    .item-subtotal { font-weight: 600; font-size: 1.05rem; white-space: nowrap; }

    .summary { padding: 1.5rem; position: sticky; top: 88px; }
    .summary h2 { font-size: 1.2rem; font-family: var(--font-body); margin-bottom: 1.25rem; }
    .summary-row {
      display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.95rem;
    }
    .summary-row.discount { color: var(--color-success); }
    .summary-row.total {
      font-size: 1.15rem; font-weight: 600; padding-top: 0.75rem;
      border-top: 1px solid var(--color-border); margin-top: 0.5rem;
    }
    .free { color: var(--color-success); font-weight: 500; }
    .free-hint { font-size: 0.85rem; color: var(--color-text-muted); margin: 0.75rem 0 1.25rem; }
    .checkout-btn { width: 100%; margin-top: 0.5rem; }
    .continue-btn { width: 100%; margin-top: 0.5rem; }

    @media (max-width: 800px) {
      .cart-layout { grid-template-columns: 1fr; }
      .summary { position: static; }
      .cart-item { grid-template-columns: 80px 1fr; }
      .item-subtotal { grid-column: 2; text-align: left; margin-top: 0.25rem; }
    }
  `]
})
export class CartComponent {
  cart = inject(CartService);
}
