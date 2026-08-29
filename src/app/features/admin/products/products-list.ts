import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-admin-products-list',
  standalone: true,

  imports: [
    RouterLink,
    FormsModule,
    DecimalPipe
  ],

  template: `
    <div class="page-enter">

      <div class="page-header">

        <div>
          <h1>Products</h1>

          <p class="muted">
            {{ products().length }} products
          </p>
        </div>

        <a
          routerLink="/products/new"
          class="btn btn-primary">

          + Add Product

        </a>

      </div>

      <div class="toolbar">

        <input
          type="search"
          class="form-control search"
          placeholder="Search name, SKU, brand..."
          [(ngModel)]="search"
          (ngModelChange)="applyFilter()" />

        <select
          class="form-control filter-select"
          [(ngModel)]="stockFilter"
          (ngModelChange)="applyFilter()">

          <option value="all">
            All stock
          </option>

          <option value="in">
            In stock
          </option>

          <option value="low">
            Low stock
          </option>

          <option value="out">
            Out of stock
          </option>

        </select>

      </div>

      @if (loading()) {

        <div
          class="skeleton"
          style="
            height: 320px;
            border-radius: var(--radius-lg);
          ">
        </div>

      } @else if (filtered().length === 0) {

        <div class="empty-state card">

          <h3>
            No products found
          </h3>

          <a
            routerLink="/products/new"
            class="btn btn-primary">

            Add your first product

          </a>

        </div>

      } @else {

        <div class="card table-card">

          <div class="table-wrap">

            <table>

              <thead>

                <tr>

                  <th></th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th></th>

                </tr>

              </thead>

              <tbody>

                @for (
                  p of filtered();
                  track p.id
                ) {

                  <tr>

                    <td>

                      <img
                        [src]="mainImg(p)"
                        [alt]="p.name"
                        class="thumb" />

                    </td>

                    <td>

                      <p class="pname">
                        {{ p.name }}
                      </p>

                      @if (p.isFeatured) {

                        <span class="feat">
                          Featured
                        </span>

                      }

                    </td>

                    <td class="sku">
                      {{ p.sku }}
                    </td>

                    <td>
                      {{ p.categoryName }}
                    </td>

                    <td>

                      <span>
                        Rs.
                        {{
                          (p.discountPrice ?? p.price)
                          | number
                        }}
                      </span>

                      @if (p.discountPrice) {

                        <span class="old">
                          Rs. {{ p.price | number }}
                        </span>

                      }

                    </td>

                    <td>

                      <span
                        class="stock"
                        [class.low]="
                          p.stockQuantity > 0 &&
                          p.stockQuantity <= p.lowStockThreshold
                        "
                        [class.out]="
                          p.stockQuantity === 0
                        ">

                        {{ p.stockQuantity }}

                      </span>

                    </td>

                    <td>

                      <span
                        class="active-badge"
                        [class.off]="!p.isActive">

                        {{
                          p.isActive
                            ? 'Active'
                            : 'Inactive'
                        }}

                      </span>

                    </td>

                    <td class="actions">

                      <a
                        [routerLink]="[
                          '/products',
                          p.id,
                          'edit'
                        ]"
                        class="btn btn-ghost btn-sm">

                        Edit

                      </a>

                      <button
                        type="button"
                        class="btn btn-ghost btn-sm danger"
                        (click)="remove(p)">

                        Delete

                      </button>

                    </td>

                  </tr>

                }

              </tbody>

            </table>

          </div>

        </div>

      }

    </div>
  `,

  styles: [`

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    h1 {
      font-size: 1.6rem;
      margin-bottom: 0.2rem;
    }

    .muted {
      color: var(--color-text-muted);
      font-size: 0.9rem;
    }

    .toolbar {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }

    .search {
      max-width: 280px;
      padding: 0.5rem 0.85rem;
    }

    .filter-select {
      width: auto;
      padding: 0.5rem 0.85rem;
    }

    .table-card {
      padding: 0;
      overflow: hidden;
    }

    .table-wrap {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    th {
      text-align: left;
      padding: 0.85rem 0.75rem;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: var(--color-text-muted);
      background: var(--color-blush);
      border-bottom: 1px solid var(--color-border);
    }

    td {
      padding: 0.75rem;
      border-bottom: 1px solid var(--color-border);
      vertical-align: middle;
    }

    .thumb {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      object-fit: cover;
      background: var(--color-blush);
    }

    .pname {
      font-weight: 500;
      margin-bottom: 0.15rem;
    }

    .feat {
      font-size: 0.7rem;
      background: var(--color-primary-light);
      color: var(--color-primary-dark);
      padding: 0.1rem 0.4rem;
      border-radius: var(--radius-full);
      font-weight: 600;
    }

    .sku {
      font-family: monospace;
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    .old {
      display: block;
      font-size: 0.8rem;
      color: var(--color-text-muted);
      text-decoration: line-through;
    }

    .stock {
      font-weight: 600;
    }

    .stock.low {
      color: var(--color-warning);
    }

    .stock.out {
      color: var(--color-danger);
    }

    .active-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-full);
      background: #e8f5e9;
      color: #2e7d32;
    }

    .active-badge.off {
      background: #f5f5f5;
      color: #757575;
    }

    .actions {
      white-space: nowrap;
    }

    .danger {
      color: var(--color-danger);
    }

  `]
})
export class AdminProductsListComponent
  implements OnInit {

  private productService =
    inject(ProductService);

  private toast =
    inject(ToastService);

  products =
    signal<Product[]>([]);

  filtered =
    signal<Product[]>([]);

  loading =
    signal(true);

  search = '';

  stockFilter = 'all';

  ngOnInit(): void {

    this.loading.set(true);

    this.productService
      .getProducts({ pageSize: 100 })
      .subscribe({

        next: res => {

          this.products.set(res.items);

          this.applyFilter();

          this.loading.set(false);

        },

        error: err => {

          console.error(
            'Failed to load products:',
            err
          );

          this.products.set([]);

          this.filtered.set([]);

          this.loading.set(false);

          this.toast.error(
            'Failed to load products.'
          );

        }

      });

  }

  mainImg(p: Product): string {

    return (
      p.images.find(
        i => i.isMain
      )?.imageUrl
      ||
      p.images[0]?.imageUrl
      ||
      ''
    );

  }

  applyFilter(): void {

    const q =
      this.search
        .toLowerCase()
        .trim();

    let list =
      this.products();

    if (q) {

      list =
        list.filter(p =>

          p.name
            .toLowerCase()
            .includes(q)

          ||

          p.sku
            .toLowerCase()
            .includes(q)

          ||

          (
            p.brand
              ?.toLowerCase()
              .includes(q)
            ?? false
          )

        );

    }

    if (this.stockFilter === 'in') {

      list =
        list.filter(
          p =>
            p.stockQuantity >
            p.lowStockThreshold
        );

    }

    if (this.stockFilter === 'low') {

      list =
        list.filter(
          p =>
            p.stockQuantity > 0 &&
            p.stockQuantity <=
              p.lowStockThreshold
        );

    }

    if (this.stockFilter === 'out') {

      list =
        list.filter(
          p =>
            p.stockQuantity === 0
        );

    }

    this.filtered.set(list);

  }

  remove(p: Product): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${p.name}"? This cannot be undone.`
    );
    if (!confirmed) return;

    this.productService.deleteProduct(p.id).subscribe({
      next: (ok) => {
        if (!ok) {
          this.toast.error('Delete failed');
          return;
        }
        this.products.update(list => list.filter(x => x.id !== p.id));
        this.applyFilter();
        this.toast.success(`"${p.name}" deleted successfully`);
      },
      error: () => this.toast.error('Could not delete product')
    });
  }

}