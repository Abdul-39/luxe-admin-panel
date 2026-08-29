import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';
import { NavbarComponent } from '../../layout/navbar/navbar';
import { FooterComponent } from '../../layout/footer/footer';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, NavbarComponent, FooterComponent],
  template: `
    <app-navbar />
    <main class="page-enter">
      <div class="container">
        <nav class="breadcrumb">
          <a routerLink="/">Home</a>
          <span>/</span>
          <span>Wishlist</span>
        </nav>
        <h1>My Wishlist</h1>

        @if (wishlist.count() === 0) {
          <div class="empty-state">
            <div class="icon">♡</div>
            <h3>Your wishlist is empty</h3>
            <p>Save items you love by tapping the heart on any product.</p>
            <a routerLink="/shop" class="btn btn-primary">Browse Products</a>
          </div>
        } @else {
          <p class="count">{{ wishlist.count() }} item(s)</p>
          <div class="product-grid">
            @for (p of wishlist.list(); track p.id) {
              <div class="wish-card">
                <app-product-card [product]="p" (wishlistToggle)="wishlist.toggle($event)" />
                <button type="button" class="btn btn-outline btn-sm move-btn" (click)="moveToCart(p)">
                  Move to Cart
                </button>
              </div>
            }
          </div>
        }
      </div>
    </main>
    <app-footer />
  `,
  styles: [`
    .breadcrumb { font-size: 0.85rem; color: var(--color-text-muted); padding: 1.5rem 0 0.5rem; display: flex; gap: 0.5rem; }
    .breadcrumb a { color: var(--color-text-muted); }
    h1 { font-size: 1.9rem; margin-bottom: 0.5rem; }
    .count { color: var(--color-text-muted); margin-bottom: 1.5rem; }
    .wish-card { display: flex; flex-direction: column; gap: 0.5rem; }
    .move-btn { width: 100%; }
  `]
})
export class WishlistComponent {
  wishlist = inject(WishlistService);
  private cart = inject(CartService);

  moveToCart(product: any): void {
    this.cart.addItem(product);
    this.wishlist.remove(product.id);
  }
}
