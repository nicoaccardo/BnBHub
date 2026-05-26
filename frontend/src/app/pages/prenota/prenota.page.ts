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
  IonInput,
  IonItem,
  IonSpinner,
  IonText
} from '@ionic/angular/standalone';
import { RoomService } from '../../services/room.service';
import { BookingService } from '../../services/booking.service';

interface Camera {
  id: number;
  nome: string;
  descrizione?: string | null;
  tipo: string;
  prezzo: number;
  capienza: number;
  immagine_url?: string | null;
}

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
    IonInput,
    IonItem,
    IonSpinner,
    IonText
  ]
})
export class PrenotaPage implements OnInit {
  bookingForm!: FormGroup;
  camereDisponibili: Camera[] = [];
  cameraSelezionata: Camera | null = null;
  isLoading = false;
  isSaving = false;
  hasSearched = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    const oggi = this.formatDate(new Date());
    const domaniDate = new Date();
    domaniDate.setDate(domaniDate.getDate() + 1);

    this.bookingForm = this.fb.group({
      data_inizio: [oggi, Validators.required],
      data_fine: [this.formatDate(domaniDate), Validators.required],
      ospiti: [1, [Validators.required, Validators.min(1)]]
    }, { validators: this.dateRangeValidator });

    this.bookingForm.valueChanges.subscribe(() => {
      this.camereDisponibili = [];
      this.cameraSelezionata = null;
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

  confermaPrenotazione(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.bookingForm.invalid || !this.cameraSelezionata) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const { data_inizio, data_fine } = this.bookingForm.value;

    this.isSaving = true;
    this.bookingService.create({
      camera_id: this.cameraSelezionata.id,
      data_inizio,
      data_fine
    }).subscribe({
      next: () => {
        this.successMessage = 'Richiesta di prenotazione inviata. Attendi la conferma dello staff.';
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
    return this.bookingForm.valid && !!this.cameraSelezionata && !this.isSaving;
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

  private dateRangeValidator(form: AbstractControl): ValidationErrors | null {
    const dataInizio = form.get('data_inizio')?.value;
    const dataFine = form.get('data_fine')?.value;

    if (!dataInizio || !dataFine) {
      return null;
    }

    return dataFine > dataInizio ? null : { invalidDateRange: true };
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private getErrorMessage(err: HttpErrorResponse, fallback: string): string {
    const apiError = err.error as { errore?: string } | null;
    return apiError?.errore || fallback;
  }
}
