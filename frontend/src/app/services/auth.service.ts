import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // URL base del backend
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Registrazione nuovo utente
  register(dati: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, dati);
  }

  // Login — salva il token JWT in localStorage
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }

  // Salva il token dopo il login
  salvaToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Restituisce il token salvato
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Controlla se l'utente è loggato
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  // Logout — rimuove il token
  logout(): void {
    localStorage.removeItem('token');
  }

}