import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Camera {
  id: number;
  nome: string;
  descrizione?: string | null;
  tipo: string;
  prezzo: number;
  capienza: number;
  disponibile: number;
  immagine_url?: string | null;
  immagini_url: string[];
  created_at?: string;
}

export interface CameraPayload {
  nome: string;
  descrizione: string;
  tipo: string;
  prezzo: number;
  capienza: number;
  disponibile: number;
  immagini_url: string[];
}

export interface RoomFilters {
  data_inizio?: string;
  data_fine?: string;
  ospiti?: number;
}

interface RoomMutationResponse {
  messaggio: string;
  id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private apiUrl = 'http://localhost:3000/rooms';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
  }

  getAll(): Observable<Camera[]> {
    return this.http.get<Camera[]>(this.apiUrl);
  }

  getDisponibili(filtri?: RoomFilters): Observable<Camera[]> {
    let params = new HttpParams();

    if (filtri?.data_inizio) {
      params = params.set('data_inizio', filtri.data_inizio);
    }

    if (filtri?.data_fine) {
      params = params.set('data_fine', filtri.data_fine);
    }

    if (filtri?.ospiti) {
      params = params.set('ospiti', String(filtri.ospiti));
    }

    return this.http.get<Camera[]>(`${this.apiUrl}/disponibili`, { params });
  }

  getById(id: number): Observable<Camera> {
    return this.http.get<Camera>(`${this.apiUrl}/${id}`);
  }

  create(room: CameraPayload): Observable<RoomMutationResponse> {
    return this.http.post<RoomMutationResponse>(this.apiUrl, room, { headers: this.getHeaders() });
  }

  update(id: number, room: CameraPayload): Observable<RoomMutationResponse> {
    return this.http.put<RoomMutationResponse>(`${this.apiUrl}/${id}`, room, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<RoomMutationResponse> {
    return this.http.delete<RoomMutationResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

}
