import { Routes } from '@angular/router';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./account-dashboard').then(
        m => m.AccountDashboardComponent
      )
  },

  {
    path: 'orders',
    loadComponent: () =>
      import('./orders-list').then(
        m => m.AccountOrdersListComponent
      )
  },

  {
    path: 'orders/:id',
    loadComponent: () =>
      import('./order-detail').then(
        m => m.AccountOrderDetailComponent
      )
  },

  {
    path: 'profile',
    loadComponent: () =>
      import('./profile').then(
        m => m.AccountProfileComponent
      )
  }
];