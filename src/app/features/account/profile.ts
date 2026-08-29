import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from '../../layout/navbar/navbar';
import { FooterComponent } from '../../layout/footer/footer';

@Component({
  selector: 'app-account-profile',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar />
    <main class="page-enter">
      <div class="container profile-wrap">
        <nav class="breadcrumb">
          <a routerLink="/account">Account</a>
          <span>/</span>
          <span>Profile</span>
        </nav>
        <h1>My Profile</h1>

        <div class="card profile-card">
          <div class="row">
            <span class="label">Name</span>
            <span class="value">{{ auth.user()?.name || '—' }}</span>
          </div>
          <div class="row">
            <span class="label">Email</span>
            <span class="value">{{ auth.user()?.email || '—' }}</span>
          </div>
          <div class="row">
            <span class="label">Phone</span>
            <span class="value">{{ auth.user()?.phone || '—' }}</span>
          </div>
          <div class="row">
            <span class="label">Role</span>
            <span class="value">{{ auth.user()?.role || 'Customer' }}</span>
          </div>
        </div>

        <div class="actions">
          <button type="button" class="btn btn-danger" (click)="logout()">
            Logout
          </button>
        </div>
      </div>
    </main>
    <app-footer />
  `,
  styles: [`
    .profile-wrap { padding: 2rem 1.25rem 4rem; max-width: 560px; }
    .breadcrumb {
      font-size: 0.85rem; color: var(--color-text-muted);
      margin-bottom: 0.75rem; display: flex; gap: 0.5rem;
    }
    .breadcrumb a { color: var(--color-text-muted); }
    h1 { font-size: 1.75rem; margin-bottom: 1.5rem; }
    .profile-card { padding: 1.5rem; margin-bottom: 1.5rem; }
    .row {
      display: flex; justify-content: space-between; gap: 1rem;
      padding: 0.65rem 0; border-bottom: 1px solid var(--color-border, #eee);
    }
    .row:last-child { border-bottom: none; }
    .label { color: var(--color-text-muted); font-size: 0.9rem; }
    .value { font-weight: 500; text-align: right; }
    .actions { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .btn {
      padding: 0.6rem 1.2rem; border-radius: 8px; border: none;
      cursor: pointer; font: inherit; font-weight: 500; text-decoration: none;
      display: inline-flex; align-items: center;
    }
    .btn-primary { background: var(--color-primary, #1a1a1a); color: #fff; }
    .btn-danger { background: #c0392b; color: #fff; }
    .btn-danger:hover { background: #a93226; }
  `]
})
export class AccountProfileComponent {
  auth = inject(AuthService);

  logout(): void {
    this.auth.logout();
  }
}
