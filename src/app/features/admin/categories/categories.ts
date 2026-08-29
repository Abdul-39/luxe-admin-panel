import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-enter">
      <div class="header-row">
        <div>
          <h1>Categories</h1>
          <p class="muted">Add, edit or delete accessory categories. Products are grouped by these.</p>
        </div>
        <button type="button" class="btn btn-primary" (click)="openCreate()">+ Add Category</button>
      </div>

      @if (showForm()) {
        <div class="card form-card">
          <h3>{{ editingId() ? 'Edit Category' : 'New Category' }}</h3>
          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Name *</label>
                <input class="form-control" formControlName="name" placeholder="e.g. Phone Cases" />
              </div>
              <div class="form-group">
                <label class="form-label">Sort Order</label>
                <input type="number" class="form-control" formControlName="sortOrder" min="0" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-control" formControlName="description" rows="2" placeholder="Short description"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Image URL</label>
              <input class="form-control" formControlName="imageUrl" placeholder="https://..." />
            </div>
            <div class="form-group checkbox-row">
              <label>
                <input type="checkbox" formControlName="isActive" /> Active
              </label>
            </div>
            <div class="actions">
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
                {{ saving() ? 'Saving…' : (editingId() ? 'Update' : 'Create') }}
              </button>
              <button type="button" class="btn btn-ghost" (click)="cancelForm()">Cancel</button>
            </div>
          </form>
        </div>
      }

      <div class="grid">
        @for (c of categories(); track c.id) {
          <div class="card item" [class.inactive]="!c.isActive">
            <div class="item-top">
              <h3>{{ c.name }}</h3>
              @if (!c.isActive) {
                <span class="badge">Inactive</span>
              }
            </div>
            <p class="count">{{ c.productCount || 0 }} products</p>
            @if (c.description) {
              <p class="desc">{{ c.description }}</p>
            }
            <div class="item-actions">
              <button type="button" class="btn-sm" (click)="openEdit(c)">Edit</button>
              <button type="button" class="btn-sm danger" (click)="remove(c)">Delete</button>
            </div>
          </div>
        } @empty {
          <p class="muted">No categories yet. Create one to start adding accessories.</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .header-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    h1 { font-size: 1.6rem; margin-bottom: 0.2rem; }
    .muted { color: var(--color-text-muted); font-size: 0.95rem; }
    .form-card { padding: 1.5rem; margin-bottom: 1.5rem; max-width: 640px; }
    .form-card h3 { margin-bottom: 1rem; font-size: 1.1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 120px; gap: 1rem; }
    .form-group { margin-bottom: 1rem; }
    .form-label { display: block; font-size: 0.85rem; margin-bottom: 0.35rem; font-weight: 500; }
    .form-control { width: 100%; padding: 0.55rem 0.75rem; border: 1px solid var(--color-border, #e5e5e5); border-radius: 8px; font: inherit; }
    textarea.form-control { resize: vertical; }
    .checkbox-row label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
    .actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
    .btn { padding: 0.55rem 1.1rem; border-radius: 8px; border: none; cursor: pointer; font: inherit; font-weight: 500; }
    .btn-primary { background: var(--color-primary, #1a1a1a); color: #fff; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-ghost { background: transparent; border: 1px solid var(--color-border, #ddd); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    .item { padding: 1.25rem; position: relative; }
    .item.inactive { opacity: 0.65; }
    .item-top { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
    .item h3 { font-size: 1rem; font-family: var(--font-body); margin: 0; }
    .badge { font-size: 0.7rem; background: #f0f0f0; padding: 0.15rem 0.45rem; border-radius: 4px; }
    .count { font-size: 0.85rem; color: var(--color-text-muted); margin: 0.35rem 0; }
    .desc { font-size: 0.8rem; color: var(--color-text-muted); margin: 0 0 0.75rem; line-height: 1.4; }
    .item-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
    .btn-sm { padding: 0.35rem 0.7rem; font-size: 0.8rem; border-radius: 6px; border: 1px solid var(--color-border, #ddd); background: #fff; cursor: pointer; }
    .btn-sm.danger { color: #c00; border-color: #f0c0c0; }
    .btn-sm:hover { background: #f8f8f8; }
  `]
})
export class AdminCategoriesComponent implements OnInit {
  private productService = inject(ProductService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  categories = signal<Category[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    imageUrl: [''],
    isActive: [true],
    sortOrder: [0]
  });

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.productService.getCategories().subscribe(c => this.categories.set(c));
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ name: '', description: '', imageUrl: '', isActive: true, sortOrder: 0 });
    this.showForm.set(true);
  }

  openEdit(c: Category) {
    this.editingId.set(c.id);
    this.form.patchValue({
      name: c.name,
      description: c.description || '',
      imageUrl: c.imageUrl || '',
      isActive: c.isActive,
      sortOrder: 0
    });
    this.showForm.set(true);
  }

  cancelForm() {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = this.form.getRawValue();
    const payload = {
      name: val.name!,
      description: val.description || undefined,
      imageUrl: val.imageUrl || undefined,
      isActive: !!val.isActive
    };
    const id = this.editingId();
    const obs = id
      ? this.productService.updateCategory(id, payload)
      : this.productService.createCategory(payload);

    obs.subscribe({
      next: () => {
        this.toast.success(id ? 'Category updated' : 'Category created');
        this.saving.set(false);
        this.cancelForm();
        this.reload();
      },
      error: () => {
        this.toast.error('Failed to save category');
        this.saving.set(false);
      }
    });
  }

  remove(c: Category) {
    if (!confirm(`Delete category "${c.name}"? If it has products they will stay but the category is removed/deactivated.`)) return;
    this.productService.deleteCategory(c.id).subscribe({
      next: () => {
        this.toast.success('Category removed');
        this.reload();
      },
      error: () => this.toast.error('Could not delete category')
    });
  }
}
