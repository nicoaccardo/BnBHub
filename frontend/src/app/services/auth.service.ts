import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface AuthTokenPayload {
  exp: number;
  id: number;
  ruolo: 'admin' | 'user';
}

interface AuthTokenHeader {
  alg: string;
}

const JWT_PART_PATTERN = /^[A-Za-z0-9_-]+$/;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  register(dati: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, dati);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/password-reset/request`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/password-reset/confirm`, { token, password });
  }

  salvaToken(token: string): void {
    if (!this.decodeValidToken(token)) {
      this.logout();
      return;
    }

    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');

    if (!token || !this.decodeValidToken(token)) {
      if (token) {
        this.logout();
      }

      return null;
    }

    return token;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getUserRole(): string | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    return this.decodeValidToken(token)?.ruolo ?? null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  isUser(): boolean {
    return this.getUserRole() === 'user';
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  private decodeValidToken(token: string): AuthTokenPayload | null {
    const parts = token.split('.');

    if (
      parts.length !== 3 ||
      parts.some((part) => !JWT_PART_PATTERN.test(part))
    ) {
      return null;
    }

    try {
      const header = this.decodeTokenPart<Partial<AuthTokenHeader>>(parts[0]);
      const payload = this.decodeTokenPart<Partial<AuthTokenPayload>>(parts[1]);
      const hasValidRole = payload.ruolo === 'admin' || payload.ruolo === 'user';

      if (
        header.alg !== 'HS256' ||
        typeof payload.id !== 'number' ||
        !Number.isInteger(payload.id) ||
        typeof payload.exp !== 'number' ||
        !Number.isFinite(payload.exp) ||
        payload.exp * 1000 <= Date.now() ||
        !hasValidRole
      ) {
        return null;
      }

      return payload as AuthTokenPayload;
    } catch {
      return null;
    }
  }

  private decodeTokenPart<T>(part: string): T {
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return JSON.parse(atob(paddedBase64)) as T;
  }
}
