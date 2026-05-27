import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface SimulatedPaymentRequest {
  amount: number;
  currency?: string;
  paymentMethodToken: string;
  booking?: {
    camera_id: number;
    data_inizio: string;
    data_fine: string;
  };
}

export interface SimulatedPaymentResponse {
  success: boolean;
  stato: string;
  messaggio: string;
  transactionId: string;
  paymentIntentId: string;
  provider: string;
  providerStatus: string;
  authorized: boolean;
  captured: boolean;
  captureMode: string;
  amount: number;
  amountCents: number;
  currency: string;
  paymentMethod: {
    type: string;
    token: string;
    brand: string;
    last4: string;
  };
  processedAt: string;
  integrationHint: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:3000/payments';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
  }

  simulatePayment(payment: SimulatedPaymentRequest): Observable<SimulatedPaymentResponse> {
    return this.http.post<SimulatedPaymentResponse>(`${this.apiUrl}/simulate`, payment, {
      headers: this.getHeaders()
    });
  }
}
