import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError, delay, map, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models';

const TOKEN_KEY = 'ma_auth_token';
const USER_KEY = 'ma_user';

/** Backend wraps payloads in { success, message, data } */
interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  /** Set false when the ASP.NET API is running and you want real JWT auth. */
  /** false = real JWT API; true = offline demo */
  private useMock = false;

  private currentUser = signal<User | null>(this.loadUser());
  private token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.token() && !!this.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'Admin');
  readonly isCustomer = computed(() => this.currentUser()?.role === 'Customer');

  login(credentials: LoginRequest): Observable<AuthResponse> {
    if (this.useMock) {
      return this.mockLogin(credentials, false);
    }
    return this.http
      .post<ApiEnvelope<AuthResponse> | AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        map(res => this.unwrap(res)),
        tap(res => this.handleAuthSuccess(res))
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    if (this.useMock) {
      const user: User = {
        id: Date.now(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: 'Customer',
        createdAt: new Date().toISOString()
      };
      const res: AuthResponse = {
        token: 'mock-customer-' + Date.now(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        user
      };
      return of(res).pipe(delay(400), tap(r => this.handleAuthSuccess(r)));
    }
    return this.http
      .post<ApiEnvelope<AuthResponse> | AuthResponse>(`${environment.apiUrl}/auth/register`, data)
      .pipe(
        map(res => this.unwrap(res)),
        tap(res => this.handleAuthSuccess(res))
      );
  }

  adminLogin(credentials: LoginRequest): Observable<AuthResponse> {
    if (this.useMock) {
      return this.mockLogin(credentials, true);
    }
    return this.http
      .post<ApiEnvelope<AuthResponse> | AuthResponse>(`${environment.apiUrl}/auth/admin-login`, credentials)
      .pipe(
        map(res => this.unwrap(res)),
        tap(res => this.handleAuthSuccess(res))
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this.token();
  }

  private unwrap(res: ApiEnvelope<AuthResponse> | AuthResponse): AuthResponse {
    if (res && typeof res === 'object' && 'data' in res && (res as ApiEnvelope<AuthResponse>).data) {
      return (res as ApiEnvelope<AuthResponse>).data!;
    }
    if (res && typeof res === 'object' && 'token' in res) {
      return res as AuthResponse;
    }
    throw new Error('Unexpected auth response shape');
  }

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.token.set(res.token);
    this.currentUser.set(res.user);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /** Demo credentials work offline. */
  private mockLogin(credentials: LoginRequest, requireAdmin: boolean): Observable<AuthResponse> {
    const email = (credentials.email || '').toLowerCase().trim();
    const isAdminEmail = email.includes('admin') || email === 'admin@luxemobile.pk';

    if (requireAdmin && !isAdminEmail && credentials.password.length < 1) {
      return throwError(() => ({ error: { message: 'Admin access required' } })).pipe(delay(300));
    }

    const role: 'Admin' | 'Customer' = requireAdmin || isAdminEmail ? 'Admin' : 'Customer';
    const user: User = {
      id: role === 'Admin' ? 1 : 2,
      name: role === 'Admin' ? 'Store Admin' : 'Demo Customer',
      email: email || (role === 'Admin' ? 'admin@luxemobile.pk' : 'customer@example.com'),
      role,
      createdAt: new Date().toISOString()
    };
    const res: AuthResponse = {
      token: `mock-${role.toLowerCase()}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      user
    };
    return of(res).pipe(delay(350), tap(r => this.handleAuthSuccess(r)));
  }
}
