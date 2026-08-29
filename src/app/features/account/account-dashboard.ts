import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from '../../layout/navbar/navbar';
import { FooterComponent } from '../../layout/footer/footer';

@Component({
  selector: 'app-account-dashboard',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar />
    <main class="page-enter">
      <div class="container">
        <div class="header-row">
          <div>
            <h1>My Account</h1>
            <p class="welcome">Hello, {{ auth.user()?.name || 'Customer' }}
              @if (auth.user()?.role) {
                <span class="role-tag">{{ auth.user()?.role }}</span>
              }
            </p>
          </div>
          <button type="button" class="btn btn-logout" (click)="logout()">Logout</button>
        </div>

        <div class="grid">
          <a routerLink="/account/orders" class="card tile">
            <span class="icon">☰</span>
            <h3>My Orders</h3>
            <p>Track orders and cancel within 24 hours</p>
          </a>
          <a routerLink="/account/profile" class="card tile">
            <span class="icon">👤</span>
            <h3>My Profile</h3>
            <p>Name, email, phone — and logout</p>
          </a>
          <a routerLink="/wishlist" class="card tile">
            <span class="icon">♡</span>
            <h3>Wishlist</h3>
            <p>Saved items you love</p>
          </a>
          <a routerLink="/cart" class="card tile">
            <span class="icon">🛒</span>
            <h3>Cart</h3>
            <p>Review items before checkout</p>
          </a>
        </div>
      </div>
    </main>
    <app-footer />
  `,
  styles: [`
    .container { padding: 2rem 1.25rem 4rem; }
    .header-row {
      display: flex; justify-content: space-between; align-items: flex-start;
      gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;
    }
    h1 { font-size: 1.75rem; margin-bottom: 0.35rem; }
    .welcome { color: var(--color-text-muted); }
    .role-tag {
      display: inline-block; margin-left: 0.5rem; font-size: 0.75rem;
      background: #3d2c3a; color: #fff; padding: 0.15rem 0.5rem; border-radius: 4px;
    }
    .btn-logout {
      padding: 0.55rem 1.15rem; border-radius: 8px; border: none;
      background: #c0392b; color: #fff; font: inherit; font-weight: 500; cursor: pointer;
    }
    .btn-logout:hover { background: #a93226; }
    .grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem;
    }
    .tile {
      padding: 1.5rem; text-decoration: none; color: inherit; transition: transform 0.2s;
    }
    .tile:hover { transform: translateY(-3px); }
    .admin-tile { border: 1px solid #3d2c3a; }
    .icon { font-size: 1.5rem; display: block; margin-bottom: 0.75rem; }
    .tile h3 { font-size: 1.1rem; font-family: var(--font-body); margin-bottom: 0.35rem; }
    .tile p { font-size: 0.9rem; color: var(--color-text-muted); }
  `]
})
export class AccountDashboardComponent {
  auth = inject(AuthService);

  logout(): void {
    this.auth.logout();
  }
}
