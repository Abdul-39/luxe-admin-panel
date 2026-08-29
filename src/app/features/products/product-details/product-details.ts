import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card';
import { NavbarComponent } from '../../../layout/navbar/navbar';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [RouterLink, DecimalPipe, FormsModule, ProductCardComponent, NavbarComponent],
  template: `
    <app-navbar />
    <main class="page-enter">
      @if (loading()) {
        <div class="container" style="padding: 3rem 0;">
          <div class="skeleton" style="height: 480px; border-radius: var(--radius-lg);"></div>
        </div>
      } @else if (!product()) {
        <div class="container empty-state">
          <h3>Product not found</h3>
          <p>This product may have been removed or the link is incorrect.</p>
          <a routerLink="/shop" class="btn btn-primary">Back to Shop</a>
        </div>
      } @else {
        <div class="container">
          <nav class="breadcrumb">
            <a routerLink="/">Home</a>
            <span>/</span>
            <a routerLink="/shop">Shop</a>
            <span>/</span>
            <span>{{ product()!.name }}</span>
          </nav>

          <div class="detail-layout">
            <!-- Gallery -->
            <div class="gallery">
              <div class="main-image">
                <img [src]="selectedImage()" [alt]="product()!.name" />
                @if (product()!.discountPrice) {
                  <span class="badge badge-discount">{{ discountPercent() }}% OFF</span>
                }
              </div>
              @if (product()!.images.length > 1) {
                <div class="thumbs">
                  @for (img of product()!.images; track img.id) {
                    <button type="button" class="thumb" [class.active]="selectedImage() === img.imageUrl"
                            (click)="selectedImage.set(img.imageUrl)">
                      <img [src]="img.imageUrl" [alt]="product()!.name" />
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Info -->
            <div class="info">
              <p class="category">{{ product()!.categoryName }} · {{ product()!.brand }}</p>
              <h1>{{ product()!.name }}</h1>

              <div class="rating-row">
                <span class="stars">★★★★★</span>
                <span>{{ product()!.averageRating | number:'1.1-1' }}</span>
                <span class="muted">({{ product()!.reviewCount }} reviews)</span>
              </div>

              <div class="price-block">
                <span class="price">Rs. {{ (product()!.discountPrice ?? product()!.price) | number }}</span>
                @if (product()!.discountPrice) {
                  <span class="old">Rs. {{ product()!.price | number }}</span>
                }
              </div>

              @if (product()!.stockQuantity === 0) {
                <p class="stock out">Out of stock</p>
              } @else if (product()!.stockQuantity <= product()!.lowStockThreshold) {
                <p class="stock low">Only {{ product()!.stockQuantity }} left in stock</p>
              } @else {
                <p class="stock in">In stock</p>
              }

              <p class="desc">{{ product()!.description }}</p>

              @if (product()!.colors?.length) {
                <div class="variants">
                  <label>Color</label>
                  <div class="color-list">
                    @for (c of product()!.colors; track c) {
                      <button type="button" class="color-chip" [class.active]="selectedColor() === c"
                              (click)="selectedColor.set(c)">{{ c }}</button>
                    }
                  </div>
                </div>
              }

              <div class="qty-row">
                <label>Quantity</label>
                <div class="qty-control">
                  <button type="button" (click)="changeQty(-1)" [disabled]="quantity() <= 1">−</button>
                  <input type="number" [value]="quantity()" (change)="onQtyInput($event)" min="1" [max]="product()!.stockQuantity" />
                  <button type="button" (click)="changeQty(1)" [disabled]="quantity() >= product()!.stockQuantity">+</button>
                </div>
              </div>

              <div class="actions">
                <button class="btn btn-outline btn-lg" [disabled]="product()!.stockQuantity === 0"
                        (click)="addToCart()">Add to Cart</button>
                <button class="btn btn-primary btn-lg" [disabled]="product()!.stockQuantity === 0"
                        (click)="buyNow()">Buy Now</button>
              </div>

              <div class="meta">
                <p><strong>SKU:</strong> {{ product()!.sku }}</p>
                @if (product()!.specifications) {
                  <div class="specs">
                    <strong>Specifications</strong>
                    <pre>{{ product()!.specifications }}</pre>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Related -->
          @if (related().length) {
            <section class="related">
              <h2>You may also like</h2>
              <div class="product-grid">
                @for (p of related(); track p.id) {
                  <app-product-card [product]="p" />
                }
              </div>
            </section>
          }
        </div>
      }
    </main>
  `,
  styles: [`
    .breadcrumb { font-size: 0.85rem; color: var(--color-text-muted); padding: 1.5rem 0 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .breadcrumb a { color: var(--color-text-muted); }
    .breadcrumb a:hover { color: var(--color-primary-dark); }

    .detail-layout {
      display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; padding-bottom: 3rem;
    }

    .gallery { position: sticky; top: 88px; height: fit-content; }
    .main-image {
      position: relative; border-radius: var(--radius-lg); overflow: hidden;
      background: var(--color-blush); aspect-ratio: 1;
    }
    .main-image img { width: 100%; height: 100%; object-fit: cover; }
    .main-image .badge { position: absolute; top: 1rem; left: 1rem; }
    .thumbs { display: flex; gap: 0.6rem; margin-top: 0.75rem; }
    .thumb {
      width: 72px; height: 72px; border-radius: var(--radius-sm); overflow: hidden;
      border: 2px solid transparent; padding: 0; cursor: pointer; background: var(--color-blush);
    }
    .thumb.active { border-color: var(--color-primary); }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }

    .category { font-size: 0.85rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.4rem; }
    h1 { font-size: 1.85rem; margin-bottom: 0.75rem; }
    .rating-row { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 1rem; font-size: 0.95rem; }
    .stars { color: #f5b942; letter-spacing: 1px; }
    .muted { color: var(--color-text-muted); }

    .price-block { display: flex; align-items: baseline; gap: 0.75rem; margin-bottom: 0.75rem; }
    .price { font-size: 1.75rem; font-weight: 600; }
    .old { font-size: 1.1rem; color: var(--color-text-muted); text-decoration: line-through; }

    .stock { font-size: 0.9rem; font-weight: 500; margin-bottom: 1rem; }
    .stock.in { color: var(--color-success); }
    .stock.low { color: var(--color-warning); }
    .stock.out { color: var(--color-danger); }

    .desc { color: var(--color-text-muted); margin-bottom: 1.5rem; line-height: 1.7; }

    .variants { margin-bottom: 1.25rem; }
    .variants label { display: block; font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem; }
    .color-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .color-chip {
      padding: 0.4rem 0.9rem; border-radius: var(--radius-full);
      border: 1.5px solid var(--color-border); background: white; cursor: pointer;
      font-size: 0.85rem; transition: all 0.2s;
    }
    .color-chip.active, .color-chip:hover {
      border-color: var(--color-primary); background: var(--color-primary-light);
    }

    .qty-row { margin-bottom: 1.5rem; }
    .qty-row label { display: block; font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem; }
    .qty-control {
      display: inline-flex; align-items: center; border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md); overflow: hidden;
    }
    .qty-control button {
      width: 40px; height: 40px; border: none; background: var(--color-blush);
      font-size: 1.2rem; cursor: pointer; color: var(--color-text);
    }
    .qty-control button:disabled { opacity: 0.4; cursor: not-allowed; }
    .qty-control input {
      width: 52px; height: 40px; border: none; text-align: center; font-size: 1rem;
      -moz-appearance: textfield;
    }
    .qty-control input::-webkit-outer-spin-button,
    .qty-control input::-webkit-inner-spin-button { -webkit-appearance: none; }

    .actions { display: flex; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .actions .btn { flex: 1; min-width: 140px; }

    .meta { font-size: 0.9rem; color: var(--color-text-muted); }
    .specs { margin-top: 1rem; }
    .specs pre {
      white-space: pre-wrap; font-family: var(--font-body); margin-top: 0.4rem;
      background: var(--color-blush); padding: 0.75rem 1rem; border-radius: var(--radius-sm);
    }

    .related { padding: 2rem 0 4rem; border-top: 1px solid var(--color-border); }
    .related h2 { font-size: 1.5rem; margin-bottom: 1.5rem; }

    @media (max-width: 900px) {
      .detail-layout { grid-template-columns: 1fr; gap: 1.5rem; }
      .gallery { position: static; }
    }
  `]
})
export class ProductDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cart = inject(CartService);

  product = signal<Product | null>(null);
  related = signal<Product[]>([]);
  loading = signal(true);
  selectedImage = signal('');
  selectedColor = signal('');
  quantity = signal(1);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (!slug) return;
      this.loading.set(true);
      this.productService.getProductBySlug(slug).subscribe(p => {
        this.product.set(p);
        if (p) {
          this.selectedImage.set(p.images.find(i => i.isMain)?.imageUrl || p.images[0]?.imageUrl || '');
          this.selectedColor.set(p.colors?.[0] || '');
          this.quantity.set(1);
          this.productService.getRelated(p.id, p.categoryId).subscribe(r => this.related.set(r));
        }
        this.loading.set(false);
      });
    });
  }

  discountPercent(): number {
    const p = this.product();
    if (!p?.discountPrice) return 0;
    return Math.round(((p.price - p.discountPrice) / p.price) * 100);
  }

  changeQty(delta: number): void {
    const p = this.product();
    if (!p) return;
    const next = this.quantity() + delta;
    if (next >= 1 && next <= p.stockQuantity) this.quantity.set(next);
  }

  onQtyInput(event: Event): void {
    const val = +(event.target as HTMLInputElement).value;
    const p = this.product();
    if (!p) return;
    if (val < 1) this.quantity.set(1);
    else if (val > p.stockQuantity) this.quantity.set(p.stockQuantity);
    else this.quantity.set(val);
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.cart.addItem(p, this.quantity());
  }

  buyNow(): void {
    const p = this.product();
    if (!p) return;
    this.cart.addItem(p, this.quantity());
    this.router.navigate(['/checkout']);
  }
}
