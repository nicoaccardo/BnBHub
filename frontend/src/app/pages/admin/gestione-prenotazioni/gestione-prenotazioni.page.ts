import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonRow,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { BookingService } from '../../../services/booking.service';

@Component({
  selector: 'app-gestione-prenotazioni',
  templateUrl: './gestione-prenotazioni.page.html',
  styleUrls: ['./gestione-prenotazioni.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonRow,
    IonSpinner,
    IonText,
    IonTitle,
    IonToolbar
  ]
})
export class GestionePrenotazioniPage implements OnInit {
  prenotazioni: any[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

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

  aggiornaStato(prenotazione: any, stato: string) {
    this.successMessage = '';
    this.errorMessage = '';

    this.bookingService.updateStato(prenotazione.id, stato).subscribe({
      next: () => {
        this.successMessage = stato === 'confermata'
          ? 'Prenotazione accettata.'
          : 'Prenotazione rifiutata.';
        this.caricaPrenotazioni();
      },
      error: (err) => {
        this.errorMessage = 'Errore durante l\'aggiornamento dello stato.';
        console.error(err);
      }
    });
  }

  statoColor(stato: string): string {
    if (stato === 'confermata') {
      return 'success';
    }

    if (stato === 'cancellata') {
      return 'danger';
    }

    return 'warning';
  }
}
