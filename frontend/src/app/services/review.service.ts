import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface RecensionePubblica {
  id: number;
  nome_ospite: string;
  camera_nome: string;
  voto: number;
  testo: string;
  created_at: string;
}

export interface RecensioneAdmin {
  id: number;
  booking_id: number;
  utente_id: number;
  camera_id: number;
  voto: number;
  testo: string;
  visibile: number;
  stato: 'in attesa' | 'pubblicata' | 'rifiutata' | string;
  motivo_rifiuto?: string | null;
  created_at: string;
  updated_at: string;
  nome: string;
  cognome: string;
  email: string;
  camera_nome: string;
  tipo: string;
  data_inizio: string;
  data_fine: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private apiUrl = 'http://localhost:3000/reviews';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
  }

  getPublic(): Observable<RecensionePubblica[]> {
    return this.http.get<RecensionePubblica[]>(`${this.apiUrl}/public`);
  }

  getAll(): Observable<RecensioneAdmin[]> {
    return this.http.get<RecensioneAdmin[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  createForBooking(bookingId: number, dati: { voto: number; testo: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings/${bookingId}`, dati, { headers: this.getHeaders() });
  }

  updateVisibilita(id: number, visibile: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/visibilita`, { visibile }, { headers: this.getHeaders() });
  }

  updateStato(
    id: number,
    stato: 'pubblicata' | 'rifiutata',
    motivo_rifiuto = ''
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/stato`, { stato, motivo_rifiuto }, { headers: this.getHeaders() });
  }

}
