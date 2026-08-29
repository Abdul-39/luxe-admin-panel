import { Component, input, output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Product } from '../../../core/models';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <article class="product-card card">
      <a [routerLink]="['/products', product().slug]" class="image-wrap">
        @if (product().discountPrice) {
          <span class="badge badge-discount">
            {{ discountPercent() }}% OFF
          </span>
        }
        @if (product().stockQuantity === 0) {
          <span class="badge badge-out stock-badge">Out of Stock</span>
        } @else if (product().stockQuantity <= product().lowStockThreshold) {
          <span class="badge badge-stock stock-badge">Only {{ product().stockQuantity }} left</span>
        }
        <img [src]="mainImage()" [alt]="product().name" loading="lazy" />
        <button class="wishlist-btn" type="button" (click)="onWishlist($event)" title="Add to wishlist">
          ♡
        </button>
      </a>
      <div class="body">
        <p class="category">{{ product().categoryName }}</p>
        <h3 class="name">
          <a [routerLink]="['/products', product().slug]">{{ product().name }}</a>
        </h3>
        @if (product().reviewCount > 0) {
          <div class="rating">
            <span class="stars">★</span>
            <span>{{ product().averageRating | number:'1.1-1' }}</span>
            <span class="count">({{ product().reviewCount }})</span>
          </div>
        }
        <div class="price-row">
          <span class="price">Rs. {{ (product().discountPrice ?? product().price) | number }}</span>
          @if (product().discountPrice) {
            <span class="old-price">Rs. {{ product().price | number }}</span>
          }
        </div>
        <div class="actions">
          <button class="btn btn-outline btn-sm" 
                  [disabled]="product().stockQuantity === 0"
                  (click)="addToCart($event)">
            Add to Cart
          </button>
          <a class="btn btn-primary btn-sm" 
             [routerLink]="['/products', product().slug]"
             [class.disabled]="product().stockQuantity === 0">
            Buy Now
          </a>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .product-card { display: flex; flex-direction: column; height: 100%; }
    .image-wrap {
      position: relative; display: block; aspect-ratio: 1;
      overflow: hidden; background: var(--color-blush);
    }
    .image-wrap img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.4s ease;
    }
    .product-card:hover .image-wrap img { transform: scale(1.06); }
    .badge { position: absolute; top: 0.75rem; left: 0.75rem; z-index: 2; }
    .stock-badge { top: auto; bottom: 0.75rem; left: 0.75rem; }
    .wishlist-btn {
      position: absolute; top: 0.75rem; right: 0.75rem;
      width: 36px; height: 36px; border-radius: 50%;
      border: none; background: rgba(255,255,255,0.9);
      font-size: 1.1rem; cursor: pointer; z-index: 2;
      transition: transform 0.2s, background 0.2s;
    }
    .wishlist-btn:hover { transform: scale(1.1); background: white; color: var(--color-primary-dark); }
    .body { padding: 1rem 1.1rem 1.25rem; display: flex; flex-direction: column; flex: 1; }
    .category { font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.25rem; }
    .name { font-size: 1rem; font-family: var(--font-body); font-weight: 500; margin-bottom: 0.4rem; line-height: 1.35; }
    .name a { color: inherit; }
    .name a:hover { color: var(--color-primary-dark); }
    .rating { font-size: 0.85rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.25rem; }
    .stars { color: #f5b942; }
    .count { color: var(--color-text-muted); }
    .price-row { display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 0.9rem; }
    .price { font-weight: 600; font-size: 1.1rem; color: var(--color-text); }
    .old-price { font-size: 0.85rem; color: var(--color-text-muted); text-decoration: line-through; }
    .actions { display: flex; gap: 0.5rem; margin-top: auto; }
    .actions .btn { flex: 1; }
    .disabled { pointer-events: none; opacity: 0.55; }
  `]
})
export class ProductCardComponent {
  product = input.required<Product>();
  wishlistToggle = output<Product>();

  private cart = inject(CartService);
  private wishlist = inject(WishlistService);

  mainImage = () => {
    const p = this.product();
    return p.images.find(i => i.isMain)?.imageUrl || p.images[0]?.imageUrl || '';
  };

  discountPercent = () => {
    const p = this.product();
    if (!p.discountPrice) return 0;
    return Math.round(((p.price - p.discountPrice) / p.price) * 100);
  };

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cart.addItem(this.product());
  }

  onWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlist.toggle(this.product());
    this.wishlistToggle.emit(this.product());
  }
}
