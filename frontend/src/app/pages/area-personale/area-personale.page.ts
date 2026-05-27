import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonItem,
  IonSpinner,
  IonTextarea,
  IonText
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../../services/booking.service';

interface PrenotazioneUtente {
  id: number;
  camera_nome: string;
  tipo: string;
  prezzo: number;
  immagine_url?: string | null;
  data_inizio: string;
  data_fine: string;
  stato: string;
  intolleranze?: string | null;
  note_ospite?: string | null;
}

@Component({
  selector: 'app-area-personale',
  templateUrl: './area-personale.page.html',
  styleUrls: ['./area-personale.page.scss'],
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
    IonItem,
    IonSpinner,
    IonTextarea,
    IonText
  ]
})
export class AreaPersonalePage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;

  prenotazioni: PrenotazioneUtente[] = [];
  forms: Record<number, {
    intolleranze: FormControl<string | null>;
    note_ospite: FormControl<string | null>;
  }> = {};
  isLoading = false;
  savingId: number | null = null;
  cancellingId: number | null = null;
  errorMessage = '';
  successMessage = '';
  highlightedBookingId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    const prenotazioneParam = this.route.snapshot.queryParamMap.get('prenotazione');
    const prenotazioneId = Number(prenotazioneParam);
    this.highlightedBookingId = Number.isInteger(prenotazioneId) ? prenotazioneId : null;
    this.caricaPrenotazioni();
  }

  caricaPrenotazioni(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.bookingService.getMie().subscribe({
      next: (prenotazioni) => {
        this.prenotazioni = prenotazioni;
        this.forms = {};

        for (const prenotazione of prenotazioni) {
          this.forms[prenotazione.id] = {
            intolleranze: this.fb.control(prenotazione.intolleranze || ''),
            note_ospite: this.fb.control(prenotazione.note_ospite || '')
          };
        }

        this.isLoading = false;

        if (this.highlightedBookingId) {
          const bookingId = this.highlightedBookingId;
          setTimeout(() => this.scrollToBooking(bookingId), 150);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(err, 'Errore durante il caricamento delle prenotazioni.');
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  salvaInfoSoggiorno(prenotazione: PrenotazioneUtente): void {
    const form = this.forms[prenotazione.id];

    if (!form) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.savingId = prenotazione.id;

    this.bookingService.updateInfoSoggiorno(prenotazione.id, {
      intolleranze: form.intolleranze.value || '',
      note_ospite: form.note_ospite.value || ''
    }).subscribe({
      next: () => {
        this.successMessage = 'Informazioni soggiorno aggiornate.';
        this.savingId = null;
        this.caricaPrenotazioni();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(err, 'Errore durante il salvataggio delle informazioni.');
        this.savingId = null;
        console.error(err);
      }
    });
  }

  annullaPrenotazione(prenotazione: PrenotazioneUtente): void {
    const conferma = window.confirm('Vuoi annullare questa prenotazione?');

    if (!conferma) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.cancellingId = prenotazione.id;

    this.bookingService.cancellaMia(prenotazione.id).subscribe({
      next: () => {
        this.successMessage = 'Prenotazione annullata.';
        this.cancellingId = null;
        this.caricaPrenotazioni();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(err, 'Errore durante l\'annullamento della prenotazione.');
        this.cancellingId = null;
        console.error(err);
      }
    });
  }

  statoColor(stato: string): string {
    if (stato === 'confermata') {
      return 'success';
    }

    if (stato === 'cancellata' || stato === 'rifiutata') {
      return 'danger';
    }

    return 'warning';
  }

  canManage(prenotazione: PrenotazioneUtente): boolean {
    return prenotazione.stato !== 'cancellata' && prenotazione.stato !== 'rifiutata';
  }

  isHighlighted(prenotazione: PrenotazioneUtente): boolean {
    return prenotazione.id === this.highlightedBookingId;
  }

  private scrollToBooking(bookingId: number): void {
    const target = document.getElementById(`prenotazione-${bookingId}`);

    if (!target || !this.content) {
      return;
    }

    this.content.getScrollElement().then((scrollElement) => {
      const targetTop = target.getBoundingClientRect().top + scrollElement.scrollTop - 92;
      this.content.scrollToPoint(0, targetTop, 450);
    });
  }

  private getErrorMessage(err: HttpErrorResponse, fallback: string): string {
    const apiError = err.error as { errore?: string } | null;
    return apiError?.errore || fallback;
  }
}
