export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  specifications?: string;
  price: number;
  discountPrice?: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  sku: string;
  brand?: string;
  categoryId: number;
  categoryName?: string;
  isFeatured: boolean;
  isActive: boolean;
  averageRating: number;
  reviewCount: number;
  images: ProductImage[];
  colors?: string[];
  createdAt: string;
}

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  isMain: boolean;
  sortOrder: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  productCount?: number;
}

export interface ProductFilter {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
