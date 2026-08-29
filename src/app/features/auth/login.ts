import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { NavbarComponent } from '../../layout/navbar/navbar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NavbarComponent],
  template: `
    <app-navbar />
    <main class="page-enter auth-page">
      <div class="auth-card card">
        <h1>Welcome back</h1>
        <p class="subtitle">Sign in to your account</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" formControlName="email" placeholder="you@example.com" />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" formControlName="password" placeholder="••••••••" />
          </div>
          @if (error()) {
            <p class="error">{{ error() }}</p>
          }
          <button type="submit" class="btn btn-primary btn-lg" style="width:100%" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="footer-text">
          Don't have an account? <a routerLink="/auth/register">Create one</a>
        </p>
        <p class="footer-text">
          <a routerLink="/admin/login">Admin login</a>
        </p>
      </div>
    </main>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 68px); display: flex; align-items: center; justify-content: center;
      padding: 2rem 1rem; background: linear-gradient(160deg, var(--color-blush), var(--color-cream));
    }
    .auth-card { width: 100%; max-width: 420px; padding: 2.5rem 2rem; }
    h1 { font-size: 1.75rem; margin-bottom: 0.35rem; text-align: center; }
    .subtitle { text-align: center; color: var(--color-text-muted); margin-bottom: 1.75rem; }
    .error { color: var(--color-danger); font-size: 0.9rem; margin-bottom: 1rem; }
    .footer-text { text-align: center; margin-top: 1.25rem; font-size: 0.9rem; color: var(--color-text-muted); }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loading = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    // Demo mode: accept any credentials and set a mock user
    // Replace with real API when backend is ready
    setTimeout(() => {
      const user = {
        id: 1,
        name: this.form.value.email!.split('@')[0],
        email: this.form.value.email!,
        role: 'Customer' as const,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('ma_auth_token', 'demo-token');
      localStorage.setItem('ma_user', JSON.stringify(user));
      // Force refresh of auth signals by reloading or manual set — for demo navigate
      this.toast.success('Signed in successfully');
      this.loading.set(false);
      this.router.navigate(['/account']);
      // Note: in real app AuthService.login() handles this
      setTimeout(() => window.location.reload(), 300);
    }, 600);
  }
}
