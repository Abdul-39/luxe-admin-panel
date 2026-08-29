import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="brand">
            <a routerLink="/" class="logo">✦ Mobile Mela</a>
            <p>Premium mobile accessories that complete your style. Quality, elegance, and care in every detail.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <a routerLink="/shop">All Products</a>
            <a routerLink="/shop" [queryParams]="{category: 1}">Phone Cases</a>
            <a routerLink="/shop" [queryParams]="{category: 4}">Earphones</a>
            <a routerLink="/shop" [queryParams]="{category: 5}">Power Banks</a>
          </div>
          <div>
            <h4>Help</h4>
            <a routerLink="/contact">Contact Us</a>
            <a routerLink="/about">About</a>
            <a routerLink="/faq">FAQ</a>
            <a routerLink="/policies">Policies</a>
          </div>
          <div>
            <h4>Account</h4>
            <a routerLink="/auth/login">Sign In</a>
            <a routerLink="/auth/register">Register</a>
            <a routerLink="/cart">Cart</a>
            <a routerLink="/wishlist">Wishlist</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2026 Mobile Mela Accessories. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #3d2c3a; color: rgba(255,255,255,0.85); padding: 3.5rem 0 1.5rem; margin-top: 2rem;
    }
    .footer-grid {
      display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 2rem; margin-bottom: 2.5rem;
    }
    .logo {
      font-family: var(--font-display); font-size: 1.4rem; color: white; display: inline-block; margin-bottom: 0.75rem;
    }
    .brand p { font-size: 0.9rem; line-height: 1.6; opacity: 0.8; max-width: 280px; }
    h4 { color: white; font-family: var(--font-body); font-size: 0.95rem; margin-bottom: 1rem; font-weight: 600; }
    a { display: block; color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-bottom: 0.5rem; transition: color 0.2s; }
    a:hover { color: var(--color-primary-light); }
    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.25rem; font-size: 0.85rem; opacity: 0.65;
    }
    @media (max-width: 768px) {
      .footer-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 480px) {
      .footer-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class FooterComponent {}
