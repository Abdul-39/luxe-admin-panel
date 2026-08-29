import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/auth.guard';

/**
 * ADMIN PANEL — separate app / server from the customer store.
 * Customers never load this bundle.
 */
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/admin/admin-login').then(m => m.AdminLoginComponent)
  },
  {
    path: '',
    canActivate: [adminGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  { path: '**', redirectTo: 'login' }
];
