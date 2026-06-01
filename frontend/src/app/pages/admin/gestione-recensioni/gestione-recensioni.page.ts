import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
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
  IonTextarea,
  IonText
} from '@ionic/angular/standalone';
import { RecensioneAdmin, ReviewService } from '../../../services/review.service';

interface SezioneRecensioni {
  id: string;
  titolo: string;
  descrizione: string;
  emptyMessage: string;
  recensioni: RecensioneAdmin[];
}

@Component({
  selector: 'app-gestione-recensioni',
  templateUrl: './gestione-recensioni.page.html',
  styleUrls: ['./gestione-recensioni.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    IonTextarea,
    IonText
  ]
})
export class GestioneRecensioniPage implements OnInit {
  recensioni: RecensioneAdmin[] = [];
  rejectForms: Record<number, FormControl<string | null>> = {};
  isLoading = false;
  updatingId: number | null = null;
  errorMessage = '';
  successMessage = '';
  readonly stelleRecensione = [1, 2, 3, 4, 5];
  readonly accordionDefaultValue = 'da-moderare';

  constructor(private fb: FormBuilder, private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.caricaRecensioni();
  }

  get recensioniDaModerare(): RecensioneAdmin[] {
    return this.recensioni.filter((recensione) => recensione.stato === 'in attesa');
  }

  get recensioniPubblicate(): RecensioneAdmin[] {
    return this.recensioni.filter((recensione) => recensione.stato === 'pubblicata');
  }

  get recensioniRifiutate(): RecensioneAdmin[] {
    return this.recensioni.filter((recensione) => recensione.stato === 'rifiutata');
  }

  get sezioniRecensioni(): SezioneRecensioni[] {
    return [
      {
        id: 'da-moderare',
        titolo: 'Da moderare',
        descrizione: 'Recensioni inviate dagli ospiti e non ancora visibili in home.',
        emptyMessage: 'Nessuna recensione in attesa.',
        recensioni: this.recensioniDaModerare
      },
      {
        id: 'pubblicate',
        titolo: 'Pubblicate',
        descrizione: 'Recensioni gia visibili nella home page.',
        emptyMessage: 'Nessuna recensione pubblicata.',
        recensioni: this.recensioniPubblicate
      },
      {
        id: 'rifiutate',
        titolo: 'Rifiutate',
        descrizione: 'Recensioni non pubblicate per contenuti non adatti.',
        emptyMessage: 'Nessuna recensione rifiutata.',
        recensioni: this.recensioniRifiutate
      }
    ];
  }

  caricaRecensioni(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reviewService.getAll().subscribe({
      next: (recensioni) => {
        this.recensioni = recensioni;
        this.rejectForms = {};

        for (const recensione of recensioni) {
          this.rejectForms[recensione.id] = this.fb.control(
            recensione.motivo_rifiuto || '',
            [Validators.maxLength(250)]
          );
        }

        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(err, 'Errore durante il caricamento delle recensioni.');
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  pubblicaRecensione(recensione: RecensioneAdmin): void {
    this.aggiornaStato(recensione, 'pubblicata');
  }

  rifiutaRecensione(recensione: RecensioneAdmin): void {
    const form = this.rejectForms[recensione.id];

    if (form?.invalid) {
      form.markAsTouched();
      this.errorMessage = 'Il motivo del rifiuto non puo superare 250 caratteri.';
      return;
    }

    const conferma = window.confirm('Vuoi rifiutare definitivamente questa recensione?');

    if (!conferma) {
      return;
    }

    this.aggiornaStato(recensione, 'rifiutata', form?.value || '');
  }

  aggiornaStato(recensione: RecensioneAdmin, stato: 'pubblicata' | 'rifiutata', motivoRifiuto = ''): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.updatingId = recensione.id;

    this.reviewService.updateStato(recensione.id, stato, motivoRifiuto).subscribe({
      next: () => {
        this.successMessage = stato === 'pubblicata'
          ? 'Recensione pubblicata in home.'
          : 'Recensione rifiutata.';
        this.updatingId = null;
        this.caricaRecensioni();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(err, 'Errore durante l\'aggiornamento della recensione.');
        this.updatingId = null;
        console.error(err);
      }
    });
  }

  statoColor(recensione: RecensioneAdmin): string {
    switch (recensione.stato) {
      case 'pubblicata':
        return 'success';
      case 'rifiutata':
        return 'danger';
      default:
        return 'warning';
    }
  }

  statoLabel(recensione: RecensioneAdmin): string {
    switch (recensione.stato) {
      case 'pubblicata':
        return 'Pubblicata';
      case 'rifiutata':
        return 'Rifiutata';
      default:
        return 'Da moderare';
    }
  }

  statoClass(recensione: RecensioneAdmin): string {
    switch (recensione.stato) {
      case 'pubblicata':
        return 'status-published';
      case 'rifiutata':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  }

  private getErrorMessage(err: HttpErrorResponse, fallback: string): string {
    const apiError = err.error as { errore?: string } | null;
    return apiError?.errore || fallback;
  }
}
