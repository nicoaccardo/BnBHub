import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private apiUrl = 'http://localhost:3000/bookings';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
  }

  getAll(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  getMie(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mie`, { headers: this.getHeaders() });
  }

  create(booking: any): Observable<any> {
    return this.http.post(this.apiUrl, booking, { headers: this.getHeaders() });
  }

  updateStato(id: number, stato: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/stato`, { stato }, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

}