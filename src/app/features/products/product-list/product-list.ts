import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product, Category, ProductFilter } from '../../../core/models';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card';
import { NavbarComponent } from '../../../layout/navbar/navbar';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, FormsModule, ProductCardComponent, NavbarComponent],
  template: `
    <app-navbar />
    <main class="page-enter">
      <div class="container">
        <div class="page-header">
          <div>
            <nav class="breadcrumb">
              <a routerLink="/">Home</a>
              <span>/</span>
              <span>Shop</span>
            </nav>
            <h1>All Accessories</h1>
            <p class="subtitle">{{ totalCount() }} products found</p>
          </div>
        </div>

        <div class="shop-layout">
          <!-- Filters sidebar -->
          <aside class="filters" [class.open]="filtersOpen()">
            <div class="filters-header">
              <h3>Filters</h3>
              <button type="button" class="btn btn-ghost btn-sm" (click)="clearFilters()">Clear all</button>
            </div>

            <div class="filter-group">
              <label class="filter-label">Search</label>
              <input type="search" class="form-control" placeholder="Name, brand, SKU..."
                     [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" />
            </div>

            <div class="filter-group">
              <label class="filter-label">Category</label>
              <div class="checkbox-list">
                <label class="check-item">
                  <input type="radio" name="cat" [value]="null" [(ngModel)]="selectedCategory" (ngModelChange)="applyFilters()" />
                  <span>All Categories</span>
                </label>
                @for (cat of categories(); track cat.id) {
                  <label class="check-item">
                    <input type="radio" name="cat" [value]="cat.id" [(ngModel)]="selectedCategory" (ngModelChange)="applyFilters()" />
                    <span>{{ cat.name }}</span>
                  </label>
                }
              </div>
            </div>

            <div class="filter-group">
              <label class="filter-label">Price Range (Rs.)</label>
              <div class="price-inputs">
                <input type="number" class="form-control" placeholder="Min" [(ngModel)]="minPrice" (ngModelChange)="applyFilters()" />
                <span>–</span>
                <input type="number" class="form-control" placeholder="Max" [(ngModel)]="maxPrice" (ngModelChange)="applyFilters()" />
              </div>
            </div>

            <div class="filter-group">
              <label class="check-item">
                <input type="checkbox" [(ngModel)]="inStockOnly" (ngModelChange)="applyFilters()" />
                <span>In stock only</span>
              </label>
            </div>

            <button type="button" class="btn btn-outline close-filters" (click)="filtersOpen.set(false)">Apply</button>
          </aside>

          <!-- Results -->
          <div class="results">
            <div class="results-toolbar">
              <button type="button" class="btn btn-outline btn-sm mobile-filter" (click)="filtersOpen.set(true)">
                Filters
              </button>
              <div class="sort-wrap">
                <label>Sort by</label>
                <select class="form-control sort-select" [(ngModel)]="sortBy" (ngModelChange)="applyFilters()">
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                  <option value="popular">Popular</option>
                </select>
              </div>
            </div>

            @if (loading()) {
              <div class="product-grid">
                @for (i of [1,2,3,4,5,6]; track i) {
                  <div class="skeleton" style="height: 360px; border-radius: var(--radius-lg);"></div>
                }
              </div>
            } @else if (products().length === 0) {
              <div class="empty-state">
                <div class="icon">⌕</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search term.</p>
                <button type="button" class="btn btn-primary" (click)="clearFilters()">Clear filters</button>
              </div>
            } @else {
              <div class="product-grid">
                @for (p of products(); track p.id) {
                  <app-product-card [product]="p" />
                }
              </div>

              @if (totalPages() > 1) {
                <div class="pagination">
                  <button type="button" class="btn btn-outline btn-sm" [disabled]="page() <= 1" (click)="goPage(page() - 1)">Previous</button>
                  <span class="page-info">Page {{ page() }} of {{ totalPages() }}</span>
                  <button type="button" class="btn btn-outline btn-sm" [disabled]="page() >= totalPages()" (click)="goPage(page() + 1)">Next</button>
                </div>
              }
            }
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .page-header { padding: 2rem 0 1.5rem; }
    .breadcrumb { font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 0.5rem; display: flex; gap: 0.5rem; }
    .breadcrumb a { color: var(--color-text-muted); }
    .breadcrumb a:hover { color: var(--color-primary-dark); }
    h1 { font-size: 1.9rem; margin-bottom: 0.25rem; }
    .subtitle { color: var(--color-text-muted); font-size: 0.95rem; }

    .shop-layout { display: grid; grid-template-columns: 260px 1fr; gap: 2rem; padding-bottom: 4rem; }

    .filters {
      background: white; border-radius: var(--radius-lg); padding: 1.5rem;
      box-shadow: var(--shadow-card); height: fit-content; position: sticky; top: 88px;
    }
    .filters-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
    .filters-header h3 { font-size: 1.1rem; font-family: var(--font-body); }
    .filter-group { margin-bottom: 1.5rem; }
    .filter-label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.6rem; color: var(--color-text); }
    .checkbox-list { display: flex; flex-direction: column; gap: 0.45rem; max-height: 220px; overflow-y: auto; }
    .check-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer; }
    .check-item input { accent-color: var(--color-primary-dark); }
    .price-inputs { display: flex; align-items: center; gap: 0.5rem; }
    .price-inputs .form-control { padding: 0.5rem 0.65rem; }
    .close-filters { display: none; width: 100%; margin-top: 0.5rem; }

    .results-toolbar {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1.25rem; gap: 1rem; flex-wrap: wrap;
    }
    .sort-wrap { display: flex; align-items: center; gap: 0.6rem; }
    .sort-wrap label { font-size: 0.9rem; color: var(--color-text-muted); }
    .sort-select { width: auto; min-width: 180px; padding: 0.5rem 0.75rem; }
    .mobile-filter { display: none; }

    .pagination {
      display: flex; justify-content: center; align-items: center; gap: 1rem;
      margin-top: 2.5rem;
    }
    .page-info { font-size: 0.9rem; color: var(--color-text-muted); }

    @media (max-width: 900px) {
      .shop-layout { grid-template-columns: 1fr; }
      .filters {
        position: fixed; top: 0; left: 0; bottom: 0; width: 300px; max-width: 85vw;
        z-index: 200; transform: translateX(-110%); transition: transform 0.3s ease;
        border-radius: 0; overflow-y: auto;
      }
      .filters.open { transform: translateX(0); box-shadow: var(--shadow-hover); }
      .close-filters { display: block; }
      .mobile-filter { display: inline-flex; }
    }
  `]
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  totalCount = signal(0);
  page = signal(1);
  totalPages = signal(1);
  filtersOpen = signal(false);

  searchTerm = '';
  selectedCategory: number | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  inStockOnly = false;
  sortBy: ProductFilter['sortBy'] = 'newest';

  ngOnInit(): void {
    this.productService.getCategories().subscribe(c => this.categories.set(c));

    this.route.queryParams.subscribe(params => {
      if (params['search']) this.searchTerm = params['search'];
      if (params['category']) this.selectedCategory = +params['category'];
      if (params['page']) this.page.set(+params['page']);
      this.loadProducts();
    });
  }

  applyFilters(): void {
    this.page.set(1);
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.inStockOnly = false;
    this.sortBy = 'newest';
    this.page.set(1);
    this.loadProducts();
  }

  goPage(p: number): void {
    this.page.set(p);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private loadProducts(): void {
    this.loading.set(true);
    const filter: ProductFilter = {
      search: this.searchTerm || undefined,
      categoryId: this.selectedCategory ?? undefined,
      minPrice: this.minPrice ?? undefined,
      maxPrice: this.maxPrice ?? undefined,
      inStockOnly: this.inStockOnly || undefined,
      sortBy: this.sortBy,
      page: this.page(),
      pageSize: 12
    };
    this.productService.getProducts(filter).subscribe(res => {
      this.products.set(res.items);
      this.totalCount.set(res.totalCount);
      this.totalPages.set(res.totalPages);
      this.loading.set(false);
    });
  }
}
