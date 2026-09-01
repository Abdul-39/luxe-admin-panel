import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { NavbarComponent } from '../../layout/navbar/navbar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NavbarComponent
  ],

  template: `
    <app-navbar />

    <main class="page-enter auth-page">
      <div class="auth-card card">

        <h1>Welcome back</h1>

        <p class="subtitle">
          Sign in to your account
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
              placeholder="you@example.com"
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
            {{ loading() ? 'Signing in...' : 'Sign In' }}
          </button>

        </form>

        <p class="footer-text">
          Don't have an account?
          <a routerLink="/auth/register">
            Create one
          </a>
        </p>

        <p class="footer-text">
          <a routerLink="/admin/login">
            Admin login
          </a>
        </p>

      </div>
    </main>
  `,

  styles: [`
    .auth-page {
      min-height: calc(100vh - 68px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background: linear-gradient(
        160deg,
        var(--color-blush),
        var(--color-cream)
      );
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 2.5rem 2rem;
    }

    h1 {
      font-size: 1.75rem;
      margin-bottom: 0.35rem;
      text-align: center;
    }

    .subtitle {
      text-align: center;
      color: var(--color-text-muted);
      margin-bottom: 1.75rem;
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

    .footer-text {
      text-align: center;
      margin-top: 1.25rem;
      font-size: 0.9rem;
      color: var(--color-text-muted);
    }
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
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    password: [
      '',
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

    this.auth.login({
      email,
      password
    }).subscribe({

      next: (response) => {

        console.log(
          'Customer login successful:',
          response
        );

        this.loading.set(false);

        this.toast.success(
          'Signed in successfully'
        );

        this.router.navigate([
          '/account'
        ]);
      },

      error: (err) => {

        console.error(
          'Customer login error:',
          err
        );

        this.loading.set(false);

        const message =
          err?.error?.message ||
          err?.message ||
          'Invalid email or password';

        this.error.set(message);

        this.toast.error(message);
      }

    });
  }
}