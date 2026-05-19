import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

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

  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getDisponibili(): Observable<any> {
    return this.http.get(`${this.apiUrl}/disponibili`);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(room: any): Observable<any> {
    return this.http.post(this.apiUrl, room, { headers: this.getHeaders() });
  }

  update(id: number, room: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, room, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

}