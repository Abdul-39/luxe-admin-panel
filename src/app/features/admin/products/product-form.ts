import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="page-enter">
      <nav class="breadcrumb">
        <a routerLink="/products">Products</a>
        <span>/</span>
        <span>{{ isEdit() ? 'Edit Product' : 'Add Product' }}</span>
      </nav>
      <h1>{{ isEdit() ? 'Edit Product' : 'Add Product' }}</h1>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-layout">
        <div class="main-col">
          <section class="card section">
            <h3>Product Information</h3>
            <div class="form-group">
              <label class="form-label">Product Name *</label>
              <input class="form-control" formControlName="name" placeholder="e.g. Crystal Clear iPhone 15 Case" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">SKU *</label>
                <input class="form-control" formControlName="sku" placeholder="CASE-IP15-CLR" />
              </div>
              <div class="form-group">
                <label class="form-label">Brand</label>
                <input class="form-control" formControlName="brand" placeholder="LuxeShield" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Category *</label>
              <select class="form-control" formControlName="categoryId">
                <option [ngValue]="null">Select category</option>
                @for (c of categories(); track c.id) {
                  <option [ngValue]="c.id">{{ c.name }}</option>
                }
              </select>
            </div>
          </section>

          <section class="card section">
            <h3>Pricing</h3>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Regular Price (Rs.) *</label>
                <input type="number" class="form-control" formControlName="price" min="0" step="1" />
              </div>
              <div class="form-group">
                <label class="form-label">Discount Price (Rs.)</label>
                <input type="number" class="form-control" formControlName="discountPrice" min="0" step="1" />
              </div>
            </div>
          </section>

          <section class="card section">
            <h3>Inventory</h3>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Stock Quantity *</label>
                <input type="number" class="form-control" formControlName="stockQuantity" min="0" />
              </div>
              <div class="form-group">
                <label class="form-label">Low Stock Threshold</label>
                <input type="number" class="form-control" formControlName="lowStockThreshold" min="0" />
              </div>
            </div>
          </section>

          <section class="card section">
            <h3>Description</h3>
            <div class="form-group">
              <textarea class="form-control" formControlName="description" rows="4"
                        placeholder="Product description..."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Specifications</label>
              <textarea class="form-control" formControlName="specifications" rows="3"
                        placeholder="Material: ...&#10;Compatibility: ..."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Colors (comma-separated)</label>
              <input class="form-control" formControlName="colors" placeholder="Clear, Smoke, Rose Gold" />
            </div>
          </section>

          <section class="card section">
            <h3>Images</h3>
            <div class="form-group">
              <label class="form-label">Upload Main Image</label>
              <div class="upload-zone" (click)="fileInput.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
                @if (previewUrl() || form.value.mainImageUrl) {
                  <img [src]="previewUrl() || form.value.mainImageUrl" alt="Preview" class="preview-img" />
                  <p class="upload-hint">Click or drop to replace</p>
                } @else {
                  <p class="upload-placeholder">📷 Click or drag image here</p>
                  <p class="upload-hint">PNG, JPG up to 5MB</p>
                }
              </div>
              <input #fileInput type="file" accept="image/*" hidden (change)="onFileSelect($event)" />
            </div>
            <div class="form-group">
              <label class="form-label">Or paste Image URL</label>
              <input class="form-control" formControlName="mainImageUrl" placeholder="https://..." (input)="previewUrl.set('')" />
            </div>
          </section>
        </div>

        <aside class="side-col">
          <section class="card section sticky">
            <h3>Visibility</h3>
            <label class="check-row">
              <input type="checkbox" formControlName="isActive" />
              <span>Active (visible to customers)</span>
            </label>
            <label class="check-row">
              <input type="checkbox" formControlName="isFeatured" />
              <span>Featured product (shows in Featured section on home)</span>
            </label>
            <label class="check-row">
              <input type="checkbox" formControlName="isSignature" />
              <span>Signature product (shows in home slider)</span>
            </label>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
                {{ saving() ? 'Saving...' : (isEdit() ? 'Update Product' : 'Create Product') }}
              </button>
              <a routerLink="/products" class="btn btn-outline">Cancel</a>
            </div>
          </section>
        </aside>
      </form>
    </div>
  `,
  styles: [`
    .breadcrumb { font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 0.75rem; display: flex; gap: 0.5rem; }
    .breadcrumb a { color: var(--color-text-muted); }
    h1 { font-size: 1.5rem; margin-bottom: 1.5rem; }

    .form-layout {
      display: grid; grid-template-columns: 1fr 280px; gap: 1.5rem; align-items: start;
    }
    .section { padding: 1.25rem; margin-bottom: 1.25rem; }
    .section h3 {
      font-size: 1rem; font-family: var(--font-body); margin-bottom: 1rem;
      padding-bottom: 0.6rem; border-bottom: 1px solid var(--color-border);
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .sticky { position: sticky; top: 80px; }
    .check-row {
      display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.85rem;
      font-size: 0.95rem; cursor: pointer;
    }
    .check-row input { accent-color: var(--color-primary-dark); }
    .form-actions { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 1.25rem; }
    .form-actions .btn { width: 100%; }
    .img-preview {
      margin-top: 0.75rem; border-radius: var(--radius-md); overflow: hidden;
      max-width: 200px; background: var(--color-blush);
    }
    .img-preview img { width: 100%; display: block; }
    .upload-zone {
      border: 2px dashed var(--color-border); border-radius: var(--radius-md);
      padding: 1.5rem; text-align: center; cursor: pointer; background: var(--color-blush);
      transition: border-color 0.2s;
    }
    .upload-zone:hover { border-color: var(--color-primary); }
    .upload-placeholder { font-size: 1rem; margin-bottom: 0.35rem; }
    .upload-hint { font-size: 0.8rem; color: var(--color-text-muted); }
    .preview-img {
      max-width: 180px; max-height: 180px; border-radius: var(--radius-sm);
      object-fit: cover; margin: 0 auto 0.5rem; display: block;
    }

    @media (max-width: 900px) {
      .form-layout { grid-template-columns: 1fr; }
      .sticky { position: static; }
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private toast = inject(ToastService);

  categories = signal<Category[]>([]);
  isEdit = signal(false);
  saving = signal(false);
  productId: number | null = null;
  previewUrl = signal('');

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    sku: ['', Validators.required],
    brand: [''],
    categoryId: [null as number | null, Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    discountPrice: [null as number | null],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    lowStockThreshold: [5],
    description: [''],
    specifications: [''],
    colors: [''],
    mainImageUrl: [''],
    isActive: [true],
    isFeatured: [false],
    isSignature: [false]
  });

  ngOnInit(): void {
    this.productService.getCategories().subscribe(c => this.categories.set(c));

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id !== 'new') {
        this.isEdit.set(true);
        this.productId = +id;
        this.productService.getProductById(+id).subscribe(p => {
          if (p) {
            this.form.patchValue({
              name: p.name,
              sku: p.sku,
              brand: p.brand || '',
              categoryId: p.categoryId,
              price: p.price,
              discountPrice: p.discountPrice ?? null,
              stockQuantity: p.stockQuantity,
              lowStockThreshold: p.lowStockThreshold,
              description: p.description,
              specifications: p.specifications || '',
              colors: p.colors?.join(', ') || '',
              mainImageUrl: p.images.find(i => i.isMain)?.imageUrl || '',
              isActive: p.isActive,
              isFeatured: p.isFeatured,
              isSignature: !!(p as any).isSignature
            });
          }
        });
      }
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.setPreview(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) this.setPreview(file);
  }

  private setPreview(file: File): void {
    if (file.size > 5 * 1024 * 1024) {
      this.toast.error('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.previewUrl.set(dataUrl);
      this.form.patchValue({ mainImageUrl: dataUrl });
      this.toast.success('Image attached — will save with product');
    };
    reader.onerror = () => this.toast.error('Could not read image');
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please fill required fields');
      return;
    }
    this.saving.set(true);
    const v = this.form.getRawValue();
    const colors = (v.colors || '')
      .split(',')
      .map((c: string) => c.trim())
      .filter(Boolean);
    const payload = {
      name: v.name,
      sku: v.sku,
      brand: v.brand,
      categoryId: v.categoryId as number,
      price: Number(v.price),
      discountPrice: v.discountPrice != null && v.discountPrice !== ('' as unknown) ? Number(v.discountPrice) : null,
      stockQuantity: Number(v.stockQuantity),
      lowStockThreshold: Number(v.lowStockThreshold),
      description: v.description,
      specifications: v.specifications,
      colors,
      mainImageUrl: v.mainImageUrl || this.previewUrl(),
      isActive: v.isActive,
      isFeatured: v.isFeatured,
      isSignature: v.isSignature
    };

    const req$ = this.isEdit() && this.productId
      ? this.productService.updateProduct(this.productId, payload)
      : this.productService.createProduct(payload);

    req$.subscribe({
      next: (p) => {
        this.saving.set(false);
        if (!p) {
          this.toast.error('Product not found');
          return;
        }
        this.toast.success(this.isEdit() ? 'Product updated successfully' : 'Product uploaded to store');
        this.router.navigate(['/products']);
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Save failed');
      }
    });
  }
}
