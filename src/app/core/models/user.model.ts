export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'Customer' | 'Admin';
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface Address {
  id: number;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  area?: string;
  postalCode?: string;
  isDefault: boolean;
}
