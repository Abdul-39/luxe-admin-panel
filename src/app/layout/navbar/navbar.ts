import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="navbar glass">
      <div class="container nav-inner">
        <a routerLink="/" class="logo">
          <span class="logo-mark">✦</span>
          <span class="logo-text">Mobile Mela</span>
        </a>

        <nav class="nav-links" [class.open]="menuOpen()">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
          <a routerLink="/shop" routerLinkActive="active">Shop</a>
          <a routerLink="/categories" routerLinkActive="active">Categories</a>
          <a routerLink="/wishlist" routerLinkActive="active">Wishlist</a>
          <a routerLink="/contact" routerLinkActive="active">Contact</a>
        </nav>

        <div class="nav-actions">
          <button class="icon-btn search-btn" type="button" (click)="toggleSearch()" title="Search">
            ⌕
          </button>
          <a routerLink="/cart" class="icon-btn cart-btn" title="Cart">
            🛒
            @if (cart.itemCount() > 0) {
              <span class="badge-count">{{ cart.itemCount() }}</span>
            }
          </a>
          @if (auth.isAuthenticated()) {
            <a routerLink="/account" class="icon-btn" title="Account">👤</a>
            <button type="button" class="btn btn-sm btn-ghost" (click)="logout()" title="Logout">Logout</button>
          } @else {
            <a routerLink="/auth/login" class="btn btn-sm btn-primary">Sign In</a>
          }
          <button class="icon-btn hamburger" type="button" (click)="toggleMenu()" aria-label="Menu">
            ☰
          </button>
        </div>
      </div>

      @if (searchOpen()) {
        <div class="search-bar">
          <div class="container">
            <input type="search" placeholder="Search accessories, brands, SKU..." 
                   class="form-control" #searchInput
                   (keyup.enter)="doSearch(searchInput.value)" />
          </div>
        </div>
      }
    </header>
  `,
  styles: [`
    .navbar {
      position: sticky; top: 0; z-index: 100;
      border-bottom: 1px solid var(--color-border);
    }
    .nav-inner {
      display: flex; align-items: center; justify-content: space-between;
      height: 68px; gap: 1.5rem;
    }
    .logo {
      display: flex; align-items: center; gap: 0.4rem;
      font-family: var(--font-display); font-size: 1.45rem; font-weight: 600;
      color: var(--color-text);
    }
    .logo-mark { color: var(--color-primary-dark); }
    .nav-links {
      display: flex; gap: 1.75rem; align-items: center;
    }
    .nav-links a {
      font-size: 0.95rem; font-weight: 500; color: var(--color-text-muted);
      position: relative; padding: 0.25rem 0;
    }
    .nav-links a:hover, .nav-links a.active { color: var(--color-primary-dark); }
    .nav-links a.active::after {
      content: ''; position: absolute; left: 0; right: 0; bottom: -2px;
      height: 2px; background: var(--color-primary); border-radius: 2px;
    }
    .nav-actions { display: flex; align-items: center; gap: 0.6rem; }
    .icon-btn {
      position: relative; width: 40px; height: 40px; border-radius: 50%;
      border: none; background: transparent; font-size: 1.2rem;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: var(--color-text); transition: background 0.2s;
    }
    .icon-btn:hover { background: var(--color-blush); }
    .badge-count {
      position: absolute; top: 2px; right: 2px;
      min-width: 18px; height: 18px; border-radius: 50%;
      background: var(--color-primary-dark); color: white;
      font-size: 0.7rem; font-weight: 600;
      display: flex; align-items: center; justify-content: center;
    }
    .hamburger { display: none; }
    .search-bar {
      padding: 0.75rem 0 1rem; border-top: 1px solid var(--color-border);
      background: var(--color-white);
    }
    .search-bar .form-control { max-width: 560px; margin: 0 auto; display: block; }

    @media (max-width: 900px) {
      .nav-links {
        position: fixed; top: 68px; left: 0; right: 0;
        background: white; flex-direction: column; padding: 1.5rem;
        gap: 1rem; box-shadow: var(--shadow-card);
        transform: translateY(-120%); opacity: 0; pointer-events: none;
        transition: all 0.3s ease; z-index: 99;
      }
      .nav-links.open {
        transform: translateY(0); opacity: 1; pointer-events: auto;
      }
      .hamburger { display: flex; }
    }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  cart = inject(CartService);

  menuOpen = signal(false);
  searchOpen = signal(false);

  toggleMenu(): void { this.menuOpen.update(v => !v); }
  toggleSearch(): void { this.searchOpen.update(v => !v); }

  doSearch(q: string): void {
    if (q.trim()) {
     window.location.href = `/shop?search=${encodeURIComponent(q.trim())}`;

    }
  }

  logout(): void {
    this.auth.logout();
  }
}
