import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonItem,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';
import { BookingService, StatoAggiornamentoPrenotazione } from '../../../services/booking.service';

type StatoPrenotazione = 'in attesa' | 'confermata' | 'rifiutata' | 'cancellata';

interface PrenotazioneAdmin {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  camera_nome: string;
  tipo: string;
  prezzo: number;
  data_inizio: string;
  data_fine: string;
  stato: StatoPrenotazione | string;
  intolleranze?: string | null;
  note_ospite?: string | null;
}

interface SezionePrenotazioni {
  id: string;
  titolo: string;
  descrizione: string;
  emptyMessage: string;
  prenotazioni: PrenotazioneAdmin[];
}

@Component({
  selector: 'app-gestione-prenotazioni',
  templateUrl: './gestione-prenotazioni.page.html',
  styleUrls: ['./gestione-prenotazioni.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonAccordion,
    IonAccordionGroup,
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonItem,
    IonSpinner,
    IonText
  ]
})
export class GestionePrenotazioniPage implements OnInit {
  prenotazioni: PrenotazioneAdmin[] = [];
  readonly accordionDefaultValue = 'in-attesa';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  get prenotazioniInAttesa(): PrenotazioneAdmin[] {
    return this.prenotazioni.filter((prenotazione) => prenotazione.stato === 'in attesa');
  }

  get prenotazioniConfermate(): PrenotazioneAdmin[] {
    return this.prenotazioni.filter((prenotazione) => prenotazione.stato === 'confermata');
  }

  get prenotazioniRifiutate(): PrenotazioneAdmin[] {
    return this.prenotazioni.filter((prenotazione) =>
      prenotazione.stato === 'rifiutata' || prenotazione.stato === 'cancellata'
    );
  }

  get sezioniPrenotazioni(): SezionePrenotazioni[] {
    return [
      {
        id: 'in-attesa',
        titolo: 'In attesa',
        descrizione: 'Richieste ancora da valutare.',
        emptyMessage: 'Nessuna prenotazione in attesa.',
        prenotazioni: this.prenotazioniInAttesa
      },
      {
        id: 'confermate',
        titolo: 'Confermate',
        descrizione: 'Prenotazioni accettate dall\'admin.',
        emptyMessage: 'Nessuna prenotazione confermata.',
        prenotazioni: this.prenotazioniConfermate
      },
      {
        id: 'rifiutate',
        titolo: 'Rifiutate',
        descrizione: 'Prenotazioni rifiutate o cancellate.',
        emptyMessage: 'Nessuna prenotazione rifiutata.',
        prenotazioni: this.prenotazioniRifiutate
      }
    ];
  }

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    this.caricaPrenotazioni();
  }

  caricaPrenotazioni() {
    this.isLoading = true;
    this.errorMessage = '';

    this.bookingService.getAll().subscribe({
      next: (prenotazioni) => {
        this.prenotazioni = prenotazioni;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Errore durante il caricamento delle prenotazioni.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  aggiornaStato(prenotazione: PrenotazioneAdmin, stato: StatoAggiornamentoPrenotazione) {
    if (this.isAzioneDisabilitata(prenotazione, stato)) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';

    this.bookingService.updateStato(prenotazione.id, stato).subscribe({
      next: () => {
        this.successMessage = stato === 'confermata'
          ? 'Prenotazione accettata.'
          : 'Prenotazione rifiutata.';
        this.caricaPrenotazioni();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(err, 'Errore durante l\'aggiornamento dello stato.');
        console.error(err);
      }
    });
  }

  statoColor(stato: string): string {
    if (stato === 'confermata') {
      return 'success';
    }

    if (stato === 'rifiutata' || stato === 'cancellata') {
      return 'danger';
    }

    return 'warning';
  }

  statoLabel(stato: string): string {
    switch (stato) {
      case 'confermata':
        return 'Accettata';
      case 'rifiutata':
        return 'Rifiutata';
      case 'cancellata':
        return 'Cancellata';
      case 'in attesa':
        return 'In attesa';
      default:
        return stato;
    }
  }

  statoClass(stato: string): string {
    switch (stato) {
      case 'confermata':
        return 'status-confirmed';
      case 'rifiutata':
        return 'status-rejected';
      case 'cancellata':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }

  isCheckInPassato(prenotazione: PrenotazioneAdmin): boolean {
    return prenotazione.data_inizio < this.getTodayDate();
  }

  isAzioneDisabilitata(prenotazione: PrenotazioneAdmin, stato: StatoAggiornamentoPrenotazione): boolean {
    return prenotazione.stato === stato || this.isCheckInPassato(prenotazione);
  }

  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private getErrorMessage(err: HttpErrorResponse, fallback: string): string {
    const apiError = err.error as { errore?: string } | null;
    return apiError?.errore || fallback;
  }
}
