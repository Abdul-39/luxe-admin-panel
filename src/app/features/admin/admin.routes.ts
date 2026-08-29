import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/dashboard').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./products/products-list').then(m => m.AdminProductsListComponent)
      },
      {
        path: 'products/new',
        loadComponent: () => import('./products/product-form').then(m => m.AdminProductFormComponent)
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./products/product-form').then(m => m.AdminProductFormComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./orders/orders-list').then(m => m.AdminOrdersListComponent)
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./orders/order-detail').then(m => m.AdminOrderDetailComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./customers/customers-list').then(m => m.AdminCustomersListComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./inventory/inventory').then(m => m.AdminInventoryComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./categories/categories').then(m => m.AdminCategoriesComponent)
      },
      {
        path: 'coupons',
        loadComponent: () => import('./coupons/coupons').then(m => m.AdminCouponsComponent)
      },
      {
        path: 'reviews',
        loadComponent: () => import('./reviews/reviews').then(m => m.AdminReviewsComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('./messages/messages').then(m => m.AdminMessagesComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings').then(m => m.AdminSettingsComponent)
      },
      {
        path: 'analytics/cancellations',
        loadComponent: () => import('./analytics/cancellations').then(m => m.AdminCancellationAnalyticsComponent)
      }
    ]
  }
];
