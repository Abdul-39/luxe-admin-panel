import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../layout/navbar/navbar';
import { FooterComponent } from '../../layout/footer/footer';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar />
    <div class="contact-page page-enter">
      <section class="hero">
        <div class="container">
          <p class="eyebrow">We're here for you</p>
          <h1>Contact {{ storeName }}</h1>
          <p class="lead">Questions about an order, product advice, or wholesale? Send a message — we reply within 24 hours.</p>
        </div>
      </section>

      <div class="container layout">
        <div class="info-col">
          <div class="info-card">
            <span class="icon">📍</span>
            <div>
              <h3>Visit / Pickup</h3>
              <p>{{ address }}</p>
            </div>
          </div>
          <div class="info-card">
            <span class="icon">📞</span>
            <div>
              <h3>Call / WhatsApp</h3>
              <p><a [href]="'tel:' + phoneTel">{{ phoneDisplay }}</a></p>
              <a class="wa-btn" [href]="waLink" target="_blank" rel="noopener">Chat on WhatsApp</a>
            </div>
          </div>
          <div class="info-card">
            <span class="icon">✉️</span>
            <div>
              <h3>Email</h3>
              <p><a [href]="'mailto:' + email">{{ email }}</a></p>
            </div>
          </div>
          <div class="info-card">
            <span class="icon">🕐</span>
            <div>
              <h3>Hours</h3>
              <p>Mon–Sat · 11:00 AM – 8:00 PM<br />Sunday · Closed</p>
            </div>
          </div>
        </div>

        <div class="form-col card">
          <h2>Send a message</h2>
          <p class="hint">We never share your details. Fields marked * are required.</p>

          @if (sent()) {
            <div class="success">
              <strong>Thank you!</strong>
              <p>Your message was saved. We'll get back to you soon.</p>
              <button type="button" class="btn btn-ghost" (click)="sent.set(false)">Send another</button>
            </div>
          } @else {
            <form (ngSubmit)="submit()">
              <div class="form-group">
                <label class="form-label">Full name *</label>
                <input class="form-control" name="name" [(ngModel)]="model.name" required placeholder="Your name" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Email *</label>
                  <input type="email" class="form-control" name="email" [(ngModel)]="model.email" required placeholder="you@email.com" />
                </div>
                <div class="form-group">
                  <label class="form-label">Phone</label>
                  <input class="form-control" name="phone" [(ngModel)]="model.phone" placeholder="03XX XXXXXXX" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Subject</label>
                <select class="form-control" name="subject" [(ngModel)]="model.subject">
                  <option>Order help</option>
                  <option>Product question</option>
                  <option>Wholesale / bulk</option>
                  <option>Feedback</option>
                  <option>Other</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Message *</label>
                <textarea class="form-control" name="message" rows="5" [(ngModel)]="model.message" required placeholder="How can we help?"></textarea>
              </div>
              <button type="submit" class="btn btn-primary" [disabled]="sending()">
                {{ sending() ? 'Sending…' : 'Send message' }}
              </button>
            </form>
          }
        </div>
      </div>
    </div>
    <app-footer />
  `,
  styles: [`
    .contact-page { padding-bottom: 3rem; }
    .hero {
      background: linear-gradient(135deg, #fdf2f8 0%, #fff7ed 50%, #f5f3ff 100%);
      padding: 3rem 0 2.5rem; border-bottom: 1px solid var(--color-border, #f3e8ee);
      margin-bottom: 2rem;
    }
    .eyebrow {
      font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--color-primary, #e11d48); margin-bottom: 0.5rem;
    }
    h1 { font-size: clamp(1.75rem, 3vw, 2.4rem); margin-bottom: 0.5rem; }
    .lead { color: var(--color-text-muted, #6b7280); max-width: 520px; line-height: 1.6; }
    .layout {
      display: grid; grid-template-columns: 1fr 1.2fr; gap: 2rem; align-items: start;
    }
    @media (max-width: 860px) { .layout { grid-template-columns: 1fr; } }
    .info-card {
      display: flex; gap: 1rem; padding: 1.15rem 1.25rem; margin-bottom: 0.85rem;
      background: var(--color-surface, #fff); border: 1px solid var(--color-border, #eee);
      border-radius: 16px;
    }
    .icon { font-size: 1.4rem; line-height: 1; }
    .info-card h3 { font-size: 0.95rem; margin-bottom: 0.25rem; }
    .info-card p { font-size: 0.9rem; color: var(--color-text-muted, #6b7280); margin: 0; line-height: 1.5; }
    .info-card a { color: var(--color-primary, #e11d48); }
    .wa-btn {
      display: inline-block; margin-top: 0.5rem; font-size: 0.85rem; font-weight: 600;
      color: #059669 !important;
    }
    .form-col { padding: 1.75rem; border-radius: 20px; }
    .form-col h2 { font-size: 1.25rem; margin-bottom: 0.35rem; }
    .hint { font-size: 0.85rem; color: var(--color-text-muted, #6b7280); margin-bottom: 1.25rem; }
    .form-group { margin-bottom: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 520px) { .form-row { grid-template-columns: 1fr; } }
    .success {
      padding: 1.5rem; background: #ecfdf5; border-radius: 14px; color: #047857;
    }
    .success strong { display: block; margin-bottom: 0.35rem; }
  `]
})
export class ContactComponent {
  private toast = inject(ToastService);

  storeName = environment.storeName || 'Luxe Mobile Accessories';
  /** Update these to your real store details */
  address = 'Shop 12, Main Market, Lahore, Pakistan';
  phoneDisplay = '0300 1234567';
  phoneTel = '+923001234567';
  email = 'hello@luxemobile.pk';
  waLink = 'https://wa.me/923001234567?text=' + encodeURIComponent('Hi! I have a question about Luxe Mobile Accessories.');

  model = { name: '', email: '', phone: '', subject: 'Order help', message: '' };
  sending = signal(false);
  sent = signal(false);

  submit(): void {
    if (!this.model.name.trim() || !this.model.email.trim() || !this.model.message.trim()) {
      this.toast.error('Please fill name, email, and message');
      return;
    }
    this.sending.set(true);
    // Persist contact messages locally (demo until contact API exists)
    try {
      const key = 'luxe_contact_messages';
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      prev.unshift({ ...this.model, at: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(prev.slice(0, 50)));
    } catch { /* ignore */ }
    setTimeout(() => {
      this.sending.set(false);
      this.sent.set(true);
      this.toast.success('Message sent');
      this.model = { name: '', email: '', phone: '', subject: 'Order help', message: '' };
    }, 500);
  }
}
