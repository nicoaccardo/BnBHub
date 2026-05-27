import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export type StatoAggiornamentoPrenotazione = 'confermata' | 'rifiutata';

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

  updateStato(id: number, stato: StatoAggiornamentoPrenotazione): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/stato`, { stato }, { headers: this.getHeaders() });
  }

  updateInfoSoggiorno(id: number, dati: { intolleranze: string; note_ospite: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/mie/${id}/info-soggiorno`, dati, { headers: this.getHeaders() });
  }

  cancellaMia(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/mie/${id}/cancella`, {}, { headers: this.getHeaders() });
  }

}
