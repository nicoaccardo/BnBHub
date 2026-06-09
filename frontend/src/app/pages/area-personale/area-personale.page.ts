import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonItem,
  IonSpinner,
  IonTextarea,
  IonText
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { BookingService } from '../../services/booking.service';
import { ReviewService } from '../../services/review.service';

interface PrenotazioneUtente {
  id: number;
  camera_nome: string;
  tipo: string;
  prezzo: number;
  immagine_url?: string | null;
  immagini_url?: string[];
  data_inizio: string;
  data_fine: string;
  stato: string;
  intolleranze?: string | null;
  note_ospite?: string | null;
  recensione_id?: number | null;
  recensione_voto?: number | null;
  recensione_testo?: string | null;
  recensione_visibile?: number | null;
  recensione_stato?: string | null;
}

interface SezionePrenotazioniUtente {
  id: string;
  titolo: string;
  descrizione: string;
  emptyMessage: string;
  prenotazioni: PrenotazioneUtente[];
}

@Component({
  selector: 'app-area-personale',
  templateUrl: './area-personale.page.html',
  styleUrls: ['./area-personale.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonAccordion,
    IonAccordionGroup,
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonIcon,
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
  reviewForms: Record<number, {
    voto: FormControl<number | null>;
    testo: FormControl<string | null>;
  }> = {};
  readonly stelleRecensione = [1, 2, 3, 4, 5];
  readonly accordionDefaultValue = 'in-attesa';
  isLoading = false;
  savingId: number | null = null;
  cancellingId: number | null = null;
  reviewSavingId: number | null = null;
  errorMessage = '';
  successMessage = '';
  highlightedBookingId: number | null = null;
  imageIndexByBookingId: Record<number, number> = {};

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private reviewService: ReviewService
  ) {
    addIcons({ chevronBackOutline, chevronForwardOutline });
  }

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
        this.reviewForms = {};
        this.syncImageIndexes(prenotazioni);

        for (const prenotazione of prenotazioni) {
          this.forms[prenotazione.id] = {
            intolleranze: this.fb.control(prenotazione.intolleranze || ''),
            note_ospite: this.fb.control(prenotazione.note_ospite || '')
          };

          if (this.canReview(prenotazione)) {
            this.reviewForms[prenotazione.id] = {
              voto: this.fb.control(5, [Validators.required, Validators.min(1), Validators.max(5)]),
              testo: this.fb.control('', [Validators.required, Validators.maxLength(500)])
            };
          }
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

    if (!form || !this.canEditStayInfo(prenotazione)) {
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
    if (!this.canCancel(prenotazione)) {
      return;
    }

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

  inviaRecensione(prenotazione: PrenotazioneUtente): void {
    const form = this.reviewForms[prenotazione.id];

    if (!form || !this.canReview(prenotazione)) {
      return;
    }

    if (form.voto.invalid || form.testo.invalid) {
      form.testo.markAsTouched();
      this.errorMessage = 'Inserisci un voto da 1 a 5 e un testo entro 500 caratteri.';
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.reviewSavingId = prenotazione.id;

    this.reviewService.createForBooking(prenotazione.id, {
      voto: form.voto.value || 5,
      testo: form.testo.value || ''
    }).subscribe({
      next: () => {
        this.successMessage = 'Recensione inviata. Sarà visibile dopo l’approvazione.';
        this.reviewSavingId = null;
        this.caricaPrenotazioni();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(err, 'Errore durante l\'invio della recensione.');
        this.reviewSavingId = null;
        console.error(err);
      }
    });
  }

  setReviewVoto(prenotazione: PrenotazioneUtente, voto: number): void {
    const form = this.reviewForms[prenotazione.id];

    if (!form) {
      return;
    }

    form.voto.setValue(voto);
  }

  immaginiPrenotazione(prenotazione: PrenotazioneUtente): string[] {
    if (prenotazione.immagini_url?.length) {
      return prenotazione.immagini_url;
    }

    return prenotazione.immagine_url ? [prenotazione.immagine_url] : [];
  }

  immagineCorrente(prenotazione: PrenotazioneUtente): string | null {
    const immagini = this.immaginiPrenotazione(prenotazione);
    const index = this.getImageIndex(prenotazione, immagini.length);

    return immagini[index] || null;
  }

  indiceImmagineCorrente(prenotazione: PrenotazioneUtente): number {
    const immagini = this.immaginiPrenotazione(prenotazione);

    if (immagini.length === 0) {
      return 0;
    }

    return this.getImageIndex(prenotazione, immagini.length) + 1;
  }

  numeroImmagini(prenotazione: PrenotazioneUtente): number {
    return this.immaginiPrenotazione(prenotazione).length;
  }

  haGalleria(prenotazione: PrenotazioneUtente): boolean {
    return this.numeroImmagini(prenotazione) > 1;
  }

  scorriImmagine(prenotazione: PrenotazioneUtente, direction: number): void {
    const immagini = this.immaginiPrenotazione(prenotazione);

    if (immagini.length <= 1) {
      return;
    }

    const currentIndex = this.getImageIndex(prenotazione, immagini.length);
    const nextIndex = (currentIndex + direction + immagini.length) % immagini.length;

    this.imageIndexByBookingId = {
      ...this.imageIndexByBookingId,
      [prenotazione.id]: nextIndex
    };
  }

  get sezioniPrenotazioni(): SezionePrenotazioniUtente[] {
    return [
      {
        id: 'in-attesa',
        titolo: 'In attesa',
        descrizione: 'Richieste inviate e ancora da confermare.',
        emptyMessage: 'Nessuna prenotazione in attesa.',
        prenotazioni: this.sortPrenotazioniRecenti(
          this.prenotazioni.filter((prenotazione) => prenotazione.stato === 'in attesa')
        )
      },
      {
        id: 'future-confermate',
        titolo: 'Soggiorni futuri confermati',
        descrizione: 'Prenotazioni accettate con check-out non ancora passato.',
        emptyMessage: 'Nessun soggiorno futuro confermato.',
        prenotazioni: this.sortPrenotazioniRecenti(
          this.prenotazioni.filter((prenotazione) =>
            prenotazione.stato === 'confermata' && !this.isPastBooking(prenotazione)
          )
        )
      },
      {
        id: 'passate',
        titolo: 'Soggiorni passati',
        descrizione: 'Prenotazioni concluse che possono essere recensite.',
        emptyMessage: 'Nessun soggiorno passato.',
        prenotazioni: this.sortPrenotazioniRecenti(
          this.prenotazioni.filter((prenotazione) =>
            prenotazione.stato === 'confermata' && this.isPastBooking(prenotazione)
          )
        )
      },
      {
        id: 'chiuse',
        titolo: 'Cancellate e rifiutate',
        descrizione: 'Prenotazioni non più attive, disponibili solo in consultazione.',
        emptyMessage: 'Nessuna prenotazione cancellata o rifiutata.',
        prenotazioni: this.sortPrenotazioniRecenti(
          this.prenotazioni.filter((prenotazione) =>
            prenotazione.stato === 'cancellata' || prenotazione.stato === 'rifiutata'
          )
        )
      }
    ];
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

  statoLabel(stato: string): string {
    switch (stato) {
      case 'confermata':
        return 'Confermata';
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

  canEditStayInfo(prenotazione: PrenotazioneUtente): boolean {
    return !this.isClosed(prenotazione) && !this.isPastBooking(prenotazione);
  }

  canCancel(prenotazione: PrenotazioneUtente): boolean {
    return !this.isClosed(prenotazione) && !this.isPastBooking(prenotazione);
  }

  canReview(prenotazione: PrenotazioneUtente): boolean {
    return prenotazione.stato === 'confermata' && this.isPastBooking(prenotazione) && !prenotazione.recensione_id;
  }

  hasReview(prenotazione: PrenotazioneUtente): boolean {
    return !!prenotazione.recensione_id;
  }

  isPastBooking(prenotazione: PrenotazioneUtente): boolean {
    return prenotazione.data_fine <= this.getTodayDate();
  }

  reviewStatusLabel(prenotazione: PrenotazioneUtente): string {
    switch (prenotazione.recensione_stato) {
      case 'pubblicata':
        return 'Visibile in home';
      case 'rifiutata':
        return 'Non pubblicata';
      default:
        return 'In attesa di approvazione';
    }
  }

  reviewStatusColor(prenotazione: PrenotazioneUtente): string {
    switch (prenotazione.recensione_stato) {
      case 'pubblicata':
        return 'success';
      case 'rifiutata':
        return 'danger';
      default:
        return 'warning';
    }
  }

  isHighlighted(prenotazione: PrenotazioneUtente): boolean {
    return prenotazione.id === this.highlightedBookingId;
  }

  private isClosed(prenotazione: PrenotazioneUtente): boolean {
    return prenotazione.stato === 'cancellata' || prenotazione.stato === 'rifiutata';
  }

  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private sortPrenotazioniRecenti(prenotazioni: PrenotazioneUtente[]): PrenotazioneUtente[] {
    return [...prenotazioni].sort((a, b) =>
      b.data_inizio.localeCompare(a.data_inizio) || b.id - a.id
    );
  }

  private getImageIndex(prenotazione: PrenotazioneUtente, imageCount: number): number {
    if (imageCount === 0) {
      return 0;
    }

    const index = this.imageIndexByBookingId[prenotazione.id] ?? 0;
    return index >= 0 && index < imageCount ? index : 0;
  }

  private syncImageIndexes(prenotazioni: PrenotazioneUtente[]): void {
    const nextIndexes: Record<number, number> = {};

    for (const prenotazione of prenotazioni) {
      const imageCount = this.numeroImmagini(prenotazione);

      if (imageCount > 0) {
        nextIndexes[prenotazione.id] = this.getImageIndex(prenotazione, imageCount);
      }
    }

    this.imageIndexByBookingId = nextIndexes;
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
