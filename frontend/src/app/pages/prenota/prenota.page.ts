import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonSpinner,
  IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { Camera, RoomService } from '../../services/room.service';
import { BookingService } from '../../services/booking.service';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-prenota',
  templateUrl: './prenota.page.html',
  styleUrls: ['./prenota.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonIcon,
    IonInput,
    IonItem,
    IonSpinner,
    IonText
  ]
})
export class PrenotaPage implements OnInit {
  private readonly demoPaymentMethodToken = 'tok_demo_bnbhub';

  bookingForm!: FormGroup;
  paymentForm!: FormGroup;
  camereDisponibili: Camera[] = [];
  cameraSelezionata: Camera | null = null;
  imageIndexByCameraId: Record<number, number> = {};
  isLoading = false;
  isSaving = false;
  hasSearched = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private bookingService: BookingService,
    private paymentService: PaymentService
  ) {
    addIcons({ chevronBackOutline, chevronForwardOutline });
  }

  ngOnInit() {
    const oggi = this.formatDate(new Date());
    const domaniDate = new Date();
    domaniDate.setDate(domaniDate.getDate() + 1);

    this.bookingForm = this.fb.group({
      data_inizio: [oggi, Validators.required],
      data_fine: [this.formatDate(domaniDate), Validators.required],
      ospiti: [1, [Validators.required, Validators.min(1)]]
    }, { validators: this.dateRangeValidator });

    this.paymentForm = this.fb.group({
      cardholder: ['Mario Rossi', [Validators.required, Validators.minLength(3)]],
      cardNumber: ['4242 4242 4242 4242', [Validators.required, this.cardNumberValidator]],
      expiry: ['12/30', [Validators.required, this.expiryValidator]],
      cvv: ['123', [Validators.required, Validators.pattern(/^\d{3}$/)]]
    });

    this.bookingForm.valueChanges.subscribe(() => {
      this.camereDisponibili = [];
      this.cameraSelezionata = null;
      this.imageIndexByCameraId = {};
      this.hasSearched = false;
      this.errorMessage = '';
      this.successMessage = '';
    });

    this.caricaCamereDisponibili();
  }

  cercaCamere(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.caricaCamereDisponibili();
  }

  selezionaCamera(camera: Camera): void {
    this.cameraSelezionata = camera;
    this.successMessage = '';
    this.errorMessage = '';
  }

  immaginiCamera(camera: Camera): string[] {
    if (camera.immagini_url?.length) {
      return camera.immagini_url;
    }

    return camera.immagine_url ? [camera.immagine_url] : [];
  }

  immagineCorrente(camera: Camera): string | null {
    const immagini = this.immaginiCamera(camera);
    const index = this.getImageIndex(camera, immagini.length);

    return immagini[index] || null;
  }

  indiceImmagineCorrente(camera: Camera): number {
    const immagini = this.immaginiCamera(camera);

    if (immagini.length === 0) {
      return 0;
    }

    return this.getImageIndex(camera, immagini.length) + 1;
  }

  numeroImmagini(camera: Camera): number {
    return this.immaginiCamera(camera).length;
  }

  haGalleria(camera: Camera): boolean {
    return this.numeroImmagini(camera) > 1;
  }

  scorriImmagine(camera: Camera, direction: number): void {
    const immagini = this.immaginiCamera(camera);

    if (immagini.length <= 1) {
      return;
    }

    const currentIndex = this.getImageIndex(camera, immagini.length);
    const nextIndex = (currentIndex + direction + immagini.length) % immagini.length;

    this.imageIndexByCameraId = {
      ...this.imageIndexByCameraId,
      [camera.id]: nextIndex
    };
  }

  confermaPrenotazione(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.bookingForm.invalid || !this.cameraSelezionata) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const { data_inizio, data_fine } = this.bookingForm.value;
    const cameraId = this.cameraSelezionata.id;
    const amount = this.prezzoStimato;
    const paymentMethodToken = this.creaTokenPagamentoDemo();

    this.isSaving = true;

    this.paymentService.simulatePayment({
      amount,
      currency: 'EUR',
      paymentMethodToken,
      booking: {
        camera_id: cameraId,
        data_inizio,
        data_fine
      }
    }).subscribe({
      next: (payment) => {
        if (!payment.success || !payment.authorized) {
          this.errorMessage = 'Pagamento simulato non completato. Riprova tra qualche istante.';
          this.isSaving = false;
          return;
        }

        this.creaPrenotazioneDopoPagamento(cameraId, data_inizio, data_fine, payment.transactionId);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(err, 'Errore tecnico durante la simulazione del pagamento.');
        this.isSaving = false;
        console.error(err);
      }
    });
  }

  get numeroNotti(): number {
    const dataInizio = this.bookingForm?.get('data_inizio')?.value;
    const dataFine = this.bookingForm?.get('data_fine')?.value;

    if (!dataInizio || !dataFine || dataFine <= dataInizio) {
      return 0;
    }

    const inizioMs = new Date(`${dataInizio}T00:00:00`).getTime();
    const fineMs = new Date(`${dataFine}T00:00:00`).getTime();

    return Math.max(Math.round((fineMs - inizioMs) / 86400000), 0);
  }

  get prezzoStimato(): number {
    if (!this.cameraSelezionata) {
      return 0;
    }

    return this.numeroNotti * Number(this.cameraSelezionata.prezzo);
  }

  get canSubmit(): boolean {
    return this.bookingForm.valid && this.paymentForm.valid && !!this.cameraSelezionata && !this.isSaving;
  }

  paymentFieldInvalid(fieldName: string): boolean {
    const control = this.paymentForm?.get(fieldName);
    return !!control && control.touched && control.invalid;
  }

  private caricaCamereDisponibili(mantieniSuccesso = false): void {
    if (this.bookingForm.invalid) {
      return;
    }

    const { data_inizio, data_fine, ospiti } = this.bookingForm.value;

    this.isLoading = true;
    this.hasSearched = true;
    this.errorMessage = '';

    if (!mantieniSuccesso) {
      this.successMessage = '';
    }

    this.roomService.getDisponibili({
      data_inizio,
      data_fine,
      ospiti: Number(ospiti)
    }).subscribe({
      next: (camere) => {
        this.camereDisponibili = camere;
        this.syncImageIndexes(camere);
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.camereDisponibili = [];
        this.errorMessage = this.getErrorMessage(err, 'Errore durante il caricamento delle camere disponibili.');
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  private creaTokenPagamentoDemo(): string {
    // In un'integrazione reale questo token arriverebbe dall'SDK sicuro del provider
    // dopo la validazione degli hosted fields, senza inviare i dati della carta al backend.
    return this.demoPaymentMethodToken;
  }

  private creaPrenotazioneDopoPagamento(
    cameraId: number,
    dataInizio: string,
    dataFine: string,
    transactionId: string
  ): void {
    this.bookingService.create({
      camera_id: cameraId,
      data_inizio: dataInizio,
      data_fine: dataFine
    }).subscribe({
      next: () => {
        this.successMessage = `Pagamento demo autorizzato (${transactionId}). Richiesta di prenotazione inviata.`;
        this.cameraSelezionata = null;
        this.isSaving = false;
        this.caricaCamereDisponibili(true);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(err, 'Errore durante la creazione della prenotazione.');
        this.isSaving = false;
        console.error(err);
      }
    });
  }

  private dateRangeValidator(form: AbstractControl): ValidationErrors | null {
    const dataInizio = form.get('data_inizio')?.value;
    const dataFine = form.get('data_fine')?.value;

    if (!dataInizio || !dataFine) {
      return null;
    }

    return dataFine > dataInizio ? null : { invalidDateRange: true };
  }

  private cardNumberValidator(control: AbstractControl): ValidationErrors | null {
    const digits = String(control.value || '').replace(/\D/g, '');

    if (digits.length < 13 || digits.length > 19) {
      return { invalidCardNumber: true };
    }

    let sum = 0;
    let shouldDouble = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = Number(digits[i]);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0 ? null : { invalidCardNumber: true };
  }

  private expiryValidator(control: AbstractControl): ValidationErrors | null {
    const value = String(control.value || '').trim();
    const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);

    if (!match) {
      return { invalidExpiry: true };
    }

    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);
    const expiryDate = new Date(year, month, 0, 23, 59, 59);

    return expiryDate >= new Date() ? null : { invalidExpiry: true };
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private getImageIndex(camera: Camera, imageCount: number): number {
    if (imageCount === 0) {
      return 0;
    }

    const index = this.imageIndexByCameraId[camera.id] ?? 0;
    return index >= 0 && index < imageCount ? index : 0;
  }

  private syncImageIndexes(camere: Camera[]): void {
    const nextIndexes: Record<number, number> = {};

    for (const camera of camere) {
      const imageCount = this.numeroImmagini(camera);

      if (imageCount > 0) {
        nextIndexes[camera.id] = this.getImageIndex(camera, imageCount);
      }
    }

    this.imageIndexByCameraId = nextIndexes;
  }

  private getErrorMessage(err: HttpErrorResponse, fallback: string): string {
    const apiError = err.error as { errore?: string } | null;
    return apiError?.errore || fallback;
  }
}
