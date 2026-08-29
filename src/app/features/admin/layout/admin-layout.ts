import { Component, inject, signal } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  template: `
    <div class="admin-shell">

      <aside
        class="sidebar"
        [class.open]="sidebarOpen()"
      >
        <div class="sidebar-brand">
          <a routerLink="/">
            ✦ Mobile Mela Admin
          </a>
        </div>

        <nav class="sidebar-nav">

          <a
            routerLink="/"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            <span class="icon">▣</span>
            Dashboard
          </a>

          <a
            routerLink="/products"
            routerLinkActive="active"
          >
            <span class="icon">◻</span>
            Products
          </a>

          <a
            routerLink="/orders"
            routerLinkActive="active"
          >
            <span class="icon">☰</span>
            Orders
          </a>

          <a
            routerLink="/customers"
            routerLinkActive="active"
          >
            <span class="icon">☺</span>
            Customers
          </a>

          <a
            routerLink="/categories"
            routerLinkActive="active"
          >
            <span class="icon">▤</span>
            Categories
          </a>

          <a
            routerLink="/inventory"
            routerLinkActive="active"
          >
            <span class="icon">⚠</span>
            Inventory
          </a>

          <a
            routerLink="/coupons"
            routerLinkActive="active"
          >
            <span class="icon">%</span>
            Coupons
          </a>

          <a
            routerLink="/reviews"
            routerLinkActive="active"
          >
            <span class="icon">★</span>
            Reviews
          </a>

          <a
            routerLink="/messages"
            routerLinkActive="active"
          >
            <span class="icon">✉</span>
            Messages
          </a>

          <a
            routerLink="/analytics/cancellations"
            routerLinkActive="active"
          >
            <span class="icon">📊</span>
            Cancel Analytics
          </a>

          <a
            routerLink="/settings"
            routerLinkActive="active"
          >
            <span class="icon">⚙</span>
            Settings
          </a>

        </nav>

        <div class="sidebar-footer">

          <a
            href="http://localhost:4200"
            target="_blank"
            rel="noopener"
            class="view-store"
          >
            ← View Customer Store
          </a>

          <button
            type="button"
            class="logout-btn"
            (click)="logout()"
          >
            Logout
          </button>

        </div>
      </aside>

      <div class="main">

        <header class="admin-topbar">

          <button
            type="button"
            class="menu-btn"
            (click)="toggleSidebar()"
          >
            ☰
          </button>

          <div class="topbar-right">

            <span class="admin-name">
              {{ auth.user()?.name || 'Admin' }}
            </span>

            <span class="role-badge">
              Admin
            </span>

          </div>

        </header>

        <div class="content">
          <router-outlet />
        </div>

      </div>

      @if (sidebarOpen()) {
        <div
          class="overlay"
          (click)="sidebarOpen.set(false)"
        ></div>
      }

    </div>
  `,

  styles: [`
    .admin-shell {
      display: flex;
      min-height: 100vh;
      background: #f7f2f5;
    }

    .sidebar {
      width: 250px;
      background: #3d2c3a;
      color: rgba(255,255,255,0.9);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 100;
      transition: transform 0.3s ease;
    }

    .sidebar-brand {
      padding: 1.4rem 1.25rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .sidebar-brand a {
      font-family: var(--font-display);
      font-size: 1.25rem;
      color: white;
      font-weight: 600;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.75rem;
      overflow-y: auto;
    }

    .sidebar-nav a {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 1rem;
      border-radius: var(--radius-md);
      color: rgba(255,255,255,0.7);
      font-size: 0.95rem;
      margin-bottom: 0.25rem;
      transition: all 0.2s;
    }

    .sidebar-nav a:hover {
      background: rgba(255,255,255,0.08);
      color: white;
    }

    .sidebar-nav a.active {
      background:
        linear-gradient(
          135deg,
          var(--color-primary),
          var(--color-primary-dark)
        );
      color: white;
    }

    .icon {
      width: 20px;
      text-align: center;
      opacity: 0.9;
    }

    .sidebar-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .view-store {
      font-size: 0.9rem;
      color: rgba(255,255,255,0.6);
    }

    .view-store:hover {
      color: var(--color-primary-light);
    }

    .logout-btn {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.2);
      color: rgba(255,255,255,0.8);
      padding: 0.5rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 0.9rem;
    }

    .logout-btn:hover {
      background: rgba(255,255,255,0.1);
    }

    .main {
      flex: 1;
      margin-left: 250px;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .admin-topbar {
      height: 60px;
      background: white;
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .menu-btn {
      display: none;
      background: none;
      border: none;
      font-size: 1.3rem;
      cursor: pointer;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .admin-name {
      font-weight: 500;
      font-size: 0.95rem;
    }

    .role-badge {
      background: var(--color-primary-light);
      color: var(--color-primary-dark);
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-full);
    }

    .content {
      padding: 1.5rem;
      flex: 1;
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 90;
    }

    @media (max-width: 900px) {

      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .main {
        margin-left: 0;
      }

      .menu-btn {
        display: block;
      }

    }
  `]
})
export class AdminLayoutComponent {

  auth = inject(AuthService);

  sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update(value => !value);
  }

  logout(): void {
    this.auth.logout();
  }
}