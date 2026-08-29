import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product, Category } from '../../core/models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';
import { NavbarComponent } from '../../layout/navbar/navbar';
import { FooterComponent } from '../../layout/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, NavbarComponent, FooterComponent],
  template: `
    <app-navbar />
    <main class="page-enter">
      <!-- Hero -->
      <section class="hero">
        <div class="container hero-inner">
          <div class="hero-content">
            <p class="eyebrow">Premium Mobile Accessories</p>
            <h1>Accessories That<br/>Complete Your Style</h1>
            <p class="lead">Discover elegant cases, chargers, earphones and more — curated for the modern you.</p>
            <div class="hero-actions">
              <a routerLink="/shop" class="btn btn-primary btn-lg">Shop Now</a>
              <a routerLink="/categories" class="btn btn-outline btn-lg">Browse Categories</a>
            </div>
          </div>
          <div class="hero-visual">
            <div class="hero-blob"></div>
            <img src="https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=700" alt="Featured accessory" />
          </div>
        </div>
      </section>

      <!-- Categories -->
      <section class="section categories">
        <div class="container">
          <div class="section-header">
            <h2>Shop by Category</h2>
            <a routerLink="/shop" class="see-all">View all →</a>
          </div>
          <div class="category-grid">
            @for (cat of categories(); track cat.id) {
              <a [routerLink]="['/shop']" [queryParams]="{category: cat.id}" class="category-card">
                <span class="cat-icon">{{ catIcons[cat.slug] || '✦' }}</span>
                <span class="cat-name">{{ cat.name }}</span>
              </a>
            }
          </div>
        </div>
      </section>

      <!-- Featured -->
      <section class="section featured">
        <div class="container">
          <div class="section-header">
            <h2>Featured Products</h2>
            <a routerLink="/shop" class="see-all">See all →</a>
          </div>
          @if (loading()) {
            <div class="product-grid">
              @for (i of [1,2,3,4]; track i) {
                <div class="skeleton" style="height: 360px; border-radius: var(--radius-lg);"></div>
              }
            </div>
          } @else {
            <div class="product-grid">
              @for (p of featured(); track p.id) {
                <app-product-card [product]="p" />
              }
            </div>
          }
        </div>
      </section>

      <!-- Why Choose Us -->
      <section class="section why-us">
        <div class="container">
          <h2 class="text-center">Why Choose Us</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">✓</div>
              <h3>Quality Products</h3>
              <p>Carefully selected accessories that look beautiful and last longer.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🚚</div>
              <h3>Fast Delivery</h3>
              <p>Quick and reliable delivery so you can enjoy your new accessories sooner.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🔒</div>
              <h3>Secure Ordering</h3>
              <p>Safe checkout and transparent order tracking from start to finish.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">↩</div>
              <h3>Easy Returns</h3>
              <p>Hassle-free returns and cancellations within the allowed period.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Promo Banner -->
      <section class="promo">
        <div class="container promo-inner">
          <h2>Upgrade Your Setup — Shop Accessories You Love</h2>
          <p>Free delivery on orders over Rs. 3,000</p>
          <a routerLink="/shop" class="btn btn-primary btn-lg">Explore Collection</a>
        </div>
      </section>
    </main>
    <app-footer />
  `,
  styles: [`
    .hero {
      padding: 3.5rem 0 4rem;
      background: linear-gradient(160deg, var(--color-blush) 0%, var(--color-cream) 55%, #fff 100%);
      overflow: hidden;
    }
    .hero-inner {
      display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center;
    }
    .eyebrow {
      font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.12em;
      color: var(--color-primary-dark); font-weight: 600; margin-bottom: 0.75rem;
    }
    .hero h1 {
      font-size: clamp(2.2rem, 4.5vw, 3.4rem); margin-bottom: 1rem;
      line-height: 1.15;
    }
    .lead { font-size: 1.1rem; color: var(--color-text-muted); margin-bottom: 1.75rem; max-width: 420px; }
    .hero-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .hero-visual { position: relative; display: flex; justify-content: center; }
    .hero-blob {
      position: absolute; width: 320px; height: 320px; border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary-light), var(--color-accent));
      opacity: 0.45; filter: blur(40px); z-index: 0;
    }
    .hero-visual img {
      position: relative; z-index: 1; max-width: 380px; border-radius: var(--radius-xl);
      box-shadow: var(--shadow-hover);
    }

    .section { padding: 4rem 0; }
    .section-header {
      display: flex; justify-content: space-between; align-items: baseline;
      margin-bottom: 1.75rem;
    }
    .section-header h2 { font-size: 1.75rem; }
    .see-all { font-weight: 500; font-size: 0.95rem; }
    .text-center { text-align: center; margin-bottom: 2rem; }

    .category-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem;
    }
    .category-card {
      display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
      padding: 1.25rem 0.75rem; background: white; border-radius: var(--radius-md);
      box-shadow: var(--shadow-card); transition: all 0.25s ease; text-align: center;
    }
    .category-card:hover {
      transform: translateY(-3px); box-shadow: var(--shadow-hover);
      color: var(--color-primary-dark);
    }
    .cat-icon { font-size: 1.6rem; }
    .cat-name { font-size: 0.9rem; font-weight: 500; color: var(--color-text); }

    .why-us { background: white; }
    .features-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem;
    }
    .feature-card {
      text-align: center; padding: 1.75rem 1.25rem;
      border-radius: var(--radius-lg); background: var(--color-cream);
    }
    .feature-icon {
      width: 52px; height: 52px; margin: 0 auto 1rem; border-radius: 50%;
      background: var(--color-primary-light); display: flex; align-items: center;
      justify-content: center; font-size: 1.3rem;
    }
    .feature-card h3 { font-size: 1.1rem; margin-bottom: 0.4rem; font-family: var(--font-body); }
    .feature-card p { font-size: 0.9rem; color: var(--color-text-muted); }

    .promo {
      padding: 4rem 0; background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent-dark) 100%);
      color: white; text-align: center;
    }
    .promo h2 { color: white; font-size: 1.9rem; margin-bottom: 0.5rem; }
    .promo p { opacity: 0.9; margin-bottom: 1.5rem; }
    .promo .btn-primary {
      background: white; color: var(--color-primary-dark);
    }

    @media (max-width: 900px) {
      .hero-inner { grid-template-columns: 1fr; text-align: center; }
      .lead { margin-left: auto; margin-right: auto; }
      .hero-actions { justify-content: center; }
      .hero-visual { order: -1; }
      .hero-visual img { max-width: 280px; }
    }
  `]
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);

  featured = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);

  catIcons: Record<string, string> = {
    'phone-cases': '📱',
    'chargers': '🔌',
    'cables': '🔗',
    'earphones': '🎧',
    'power-banks': '🔋',
    'smart-watches': '⌚',
    'mobile-stands': '📐',
    'screen-protectors': '🛡️',
    'car-accessories': '🚗',
    'other': '✨'
  };

  ngOnInit(): void {
    this.productService.getFeatured().subscribe(p => {
      this.featured.set(p);
      this.loading.set(false);
    });
    this.productService.getCategories().subscribe(c => this.categories.set(c));
  }
}
