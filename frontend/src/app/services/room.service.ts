import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface CameraImage {
  id: number;
  url: string;
  ordine: number;
}

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
  immagini?: CameraImage[];
  created_at?: string;
}

export interface CameraPayload {
  nome: string;
  descrizione: string;
  tipo: string;
  prezzo: number;
  capienza: number;
  disponibile: number;
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

  private readonly apiUrl = `${environment.apiUrl}/rooms`;

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

  create(room: CameraPayload, images: File[]): Observable<RoomMutationResponse> {
    return this.http.post<RoomMutationResponse>(
      this.apiUrl,
      this.buildFormData(room, images),
      { headers: this.getHeaders() }
    );
  }

  update(
    id: number,
    room: CameraPayload,
    keptImageIds: number[],
    images: File[]
  ): Observable<RoomMutationResponse> {
    return this.http.put<RoomMutationResponse>(
      `${this.apiUrl}/${id}`,
      this.buildFormData(room, images, keptImageIds),
      { headers: this.getHeaders() }
    );
  }

  delete(id: number): Observable<RoomMutationResponse> {
    return this.http.delete<RoomMutationResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  private buildFormData(
    room: CameraPayload,
    images: File[],
    keptImageIds?: number[]
  ): FormData {
    const formData = new FormData();
    const camera = keptImageIds === undefined
      ? room
      : { ...room, immagini_mantenute: keptImageIds };

    formData.append('camera', JSON.stringify(camera));

    for (const image of images) {
      formData.append('immagini', image, image.name);
    }

    return formData;
  }
}
