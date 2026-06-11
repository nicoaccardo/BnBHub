/// <reference types="jasmine" />

import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { PaymentService, SimulatedPaymentResponse } from '../../services/payment.service';
import { Camera, RoomService } from '../../services/room.service';
import { PrenotaPage } from './prenota.page';

describe('PrenotaPage', () => {
  it('creates a booking only after the payment is authorized', () => {
    const { component, bookingService, paymentService } = createComponent(
      createPaymentResponse({ success: true, authorized: true })
    );
    component.selezionaCamera(createRoom());

    component.confermaPrenotazione();

    const paymentRequest = paymentService.simulatePayment.calls.mostRecent().args[0];
    expect(paymentRequest).toEqual({
      amount: 120,
      currency: 'EUR',
      paymentMethodToken: 'tok_demo_bnbhub',
      booking: {
        camera_id: 4,
        data_inizio: component.bookingForm.value.data_inizio,
        data_fine: component.bookingForm.value.data_fine
      }
    });
    expect(Object.prototype.hasOwnProperty.call(paymentRequest, 'cardNumber')).toBeFalse();
    expect(Object.prototype.hasOwnProperty.call(paymentRequest, 'cvv')).toBeFalse();
    expect(bookingService.create).toHaveBeenCalledWith({
      camera_id: 4,
      data_inizio: component.bookingForm.value.data_inizio,
      data_fine: component.bookingForm.value.data_fine
    });
    expect(component.successMessage).toContain('SIM-TEST');
    expect(component.isSaving).toBeFalse();
  });

  it('does not create a booking when payment authorization fails', () => {
    const { component, bookingService } = createComponent(
      createPaymentResponse({ success: true, authorized: false })
    );
    component.selezionaCamera(createRoom());

    component.confermaPrenotazione();

    expect(bookingService.create).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('Pagamento simulato non completato');
    expect(component.isSaving).toBeFalse();
  });
});

function createComponent(paymentResponse: SimulatedPaymentResponse) {
  const roomService = jasmine.createSpyObj<RoomService>('RoomService', [
    'getDisponibili'
  ]);
  const bookingService = jasmine.createSpyObj<BookingService>('BookingService', [
    'create'
  ]);
  const paymentService = jasmine.createSpyObj<PaymentService>('PaymentService', [
    'simulatePayment'
  ]);

  roomService.getDisponibili.and.returnValue(of([]));
  bookingService.create.and.returnValue(of({}));
  paymentService.simulatePayment.and.returnValue(of(paymentResponse));

  const component = new PrenotaPage(
    new FormBuilder(),
    roomService,
    bookingService,
    paymentService
  );
  component.ngOnInit();

  return { component, bookingService, paymentService };
}

function createRoom(): Camera {
  return {
    id: 4,
    nome: 'Camera test',
    tipo: 'doppia',
    prezzo: 120,
    capienza: 2,
    disponibile: 1,
    immagini_url: []
  };
}

function createPaymentResponse(
  overrides: Partial<SimulatedPaymentResponse>
): SimulatedPaymentResponse {
  return {
    success: true,
    stato: 'pagamento_simulato_autorizzato',
    messaggio: 'Pagamento autorizzato',
    transactionId: 'SIM-TEST',
    paymentIntentId: 'PI-TEST',
    provider: 'DemoPaymentGateway',
    providerStatus: 'authorized',
    authorized: true,
    captured: false,
    captureMode: 'manuale_demo',
    amount: 120,
    amountCents: 12000,
    currency: 'EUR',
    paymentMethod: {
      type: 'tokenized_card',
      token: 'tok_demo_bnbhub',
      brand: 'Demo Card',
      last4: '4242'
    },
    processedAt: '2026-06-11T10:00:00.000Z',
    integrationHint: 'Test',
    ...overrides
  };
}
