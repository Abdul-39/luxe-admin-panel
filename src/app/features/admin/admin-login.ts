
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule
  ],

  template: `
    <main class="auth-page page-enter">
      <div class="auth-card card">

        <div class="brand">
          ✦ Mobile Mela Admin
        </div>

        <h1>Admin Sign In</h1>

        <p class="subtitle">
          Manage products, categories, orders & more
        </p>

        <form
          [formGroup]="form"
          (ngSubmit)="onSubmit()"
        >

          <div class="form-group">
            <label class="form-label">
              Email
            </label>

            <input
              type="email"
              class="form-control"
              formControlName="email"
              placeholder="admin@luxemobile.pk"
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              Password
            </label>

            <input
              type="password"
              class="form-control"
              formControlName="password"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>

          @if (error()) {
            <p class="error">
              {{ error() }}
            </p>
          }

          <button
            type="submit"
            class="btn btn-primary btn-lg"
            style="width:100%"
            [disabled]="form.invalid || loading()"
          >
            {{ loading() ? 'Signing in...' : 'Sign In as Admin' }}
          </button>

        </form>

        <p class="back">
          <a routerLink="/">
            ← Back to store
          </a>
        </p>

      </div>
    </main>
  `,

  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background: linear-gradient(
        160deg,
        #3d2c3a 0%,
        #5a3d52 100%
      );
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: 2.5rem 2rem;
    }

    .brand {
      text-align: center;
      font-family: var(--font-display);
      font-size: 1.3rem;
      color: var(--color-primary-dark);
      margin-bottom: 1rem;
    }

    h1 {
      font-size: 1.5rem;
      text-align: center;
      margin-bottom: 0.3rem;
    }

    .subtitle {
      text-align: center;
      color: var(--color-text-muted);
      margin-bottom: 1.75rem;
      font-size: 0.95rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-label {
      display: block;
      font-size: 0.85rem;
      margin-bottom: 0.35rem;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.6rem 0.75rem;
      border: 1px solid var(--color-border, #e5e5e5);
      border-radius: 8px;
      font: inherit;
      box-sizing: border-box;
    }

    .error {
      color: var(--color-danger, #c00);
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    .back {
      text-align: center;
      margin-top: 1rem;
      font-size: 0.9rem;
    }

    .btn-primary {
      background: var(--color-primary, #1a1a1a);
      color: #fff;
      border: none;
      padding: 0.7rem 1rem;
      border-radius: 8px;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class AdminLoginComponent {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  loading = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    email: [
      'admin@luxemobile.pk',
      [
        Validators.required,
        Validators.email
      ]
    ],

    password: [
      'Admin@123',
      Validators.required
    ]
  });

  onSubmit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const { email, password } =
      this.form.getRawValue();

    this.auth.adminLogin({
      email,
      password
    }).subscribe({

      next: (response) => {

        this.loading.set(false);

        console.log(
          'ADMIN LOGIN RESPONSE:',
          response
        );

        console.log(
          'CURRENT USER:',
          this.auth.user()
        );

        console.log(
          'IS ADMIN:',
          this.auth.isAdmin()
        );

        // Make sure the returned account really is an Admin
        if (!this.auth.isAdmin()) {

          this.error.set(
            'Login succeeded, but this account does not have Admin access.'
          );

          this.toast.error(
            'Admin access denied'
          );

          this.auth.logout();

          return;
        }

        this.toast.success(
          'Welcome, Admin'
        );

        /*
         * IMPORTANT:
         *
         * Change '/admin' below if your actual
         * admin dashboard uses another route.
         */
        this.router.navigate(['/admin']);
      },

      error: (err) => {

        this.loading.set(false);

        console.error(
          'ADMIN LOGIN ERROR:',
          err
        );

        console.error(
          'SERVER RESPONSE:',
          err?.error
        );

        const message =
          err?.error?.message ||
          err?.message ||
          'Admin login failed';

        this.error.set(message);

        this.toast.error(message);
      }
    });
  }
}
