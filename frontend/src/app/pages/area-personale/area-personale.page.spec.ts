/// <reference types="jasmine" />

import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { ReviewService } from '../../services/review.service';
import { AreaPersonalePage } from './area-personale.page';

describe('AreaPersonalePage', () => {
  it('separates pending, future, past and closed bookings', () => {
    const bookings = [
      createBooking(1, 'in attesa', 10, 12),
      createBooking(2, 'confermata', 10, 12),
      createBooking(3, 'confermata', -12, -10),
      createBooking(4, 'cancellata', 10, 12)
    ];
    const { component } = createComponent(bookings);

    expect(sectionBookingIds(component, 'in-attesa')).toEqual([1]);
    expect(sectionBookingIds(component, 'future-confermate')).toEqual([2]);
    expect(sectionBookingIds(component, 'passate')).toEqual([3]);
    expect(sectionBookingIds(component, 'chiuse')).toEqual([4]);
  });

  it('allows reviews only for completed confirmed bookings without a review', () => {
    const completed = createBooking(3, 'confermata', -12, -10);
    const future = createBooking(2, 'confermata', 10, 12);
    const alreadyReviewed = {
      ...completed,
      id: 5,
      recensione_id: 9
    };
    const { component } = createComponent([completed, future, alreadyReviewed]);

    expect(component.canReview(completed)).toBeTrue();
    expect(component.canReview(future)).toBeFalse();
    expect(component.canReview(alreadyReviewed)).toBeFalse();
  });

  it('cancels an eligible booking only after confirmation', () => {
    const booking = createBooking(2, 'confermata', 10, 12);
    const { component, bookingService } = createComponent([booking]);
    spyOn(window, 'confirm').and.returnValue(true);

    component.annullaPrenotazione(booking);

    expect(bookingService.cancellaMia).toHaveBeenCalledWith(2);
    expect(component.successMessage).toBe('Prenotazione annullata.');
    expect(component.cancellingId).toBeNull();
  });

  it('submits a valid review for a completed stay', () => {
    const booking = createBooking(3, 'confermata', -12, -10);
    const { component, reviewService } = createComponent([booking]);
    component.reviewForms[booking.id].voto.setValue(4);
    component.reviewForms[booking.id].testo.setValue('Soggiorno molto piacevole');

    component.inviaRecensione(booking);

    expect(reviewService.createForBooking).toHaveBeenCalledWith(3, {
      voto: 4,
      testo: 'Soggiorno molto piacevole'
    });
    expect(component.successMessage).toContain('Recensione inviata');
    expect(component.reviewSavingId).toBeNull();
  });
});

interface TestBooking {
  id: number;
  camera_nome: string;
  tipo: string;
  prezzo: number;
  immagini_url: string[];
  data_inizio: string;
  data_fine: string;
  stato: string;
  intolleranze: string;
  note_ospite: string;
  recensione_id: number | null;
  recensione_voto: number | null;
  recensione_testo: string | null;
  recensione_visibile: number | null;
  recensione_stato: string | null;
}

function sectionBookingIds(
  component: AreaPersonalePage,
  sectionId: string
): number[] {
  return component.sezioniPrenotazioni
    .find((section) => section.id === sectionId)
    ?.prenotazioni.map((booking) => booking.id) || [];
}

function createComponent(bookings: TestBooking[]) {
  const bookingService = jasmine.createSpyObj<BookingService>('BookingService', [
    'getMie',
    'updateInfoSoggiorno',
    'cancellaMia'
  ]);
  const reviewService = jasmine.createSpyObj<ReviewService>('ReviewService', [
    'createForBooking'
  ]);
  bookingService.getMie.and.returnValue(of(bookings));
  bookingService.updateInfoSoggiorno.and.returnValue(of({}));
  bookingService.cancellaMia.and.returnValue(of({}));
  reviewService.createForBooking.and.returnValue(of({}));

  const route = {
    snapshot: {
      queryParamMap: convertToParamMap({})
    }
  } as ActivatedRoute;
  const component = new AreaPersonalePage(
    new FormBuilder(),
    route,
    bookingService,
    reviewService
  );
  component.ngOnInit();

  return { component, bookingService, reviewService };
}

function createBooking(
  id: number,
  stato: string,
  startOffsetDays: number,
  endOffsetDays: number
): TestBooking {
  return {
    id,
    camera_nome: `Camera ${id}`,
    tipo: 'doppia',
    prezzo: 120,
    immagini_url: [],
    data_inizio: offsetDate(startOffsetDays),
    data_fine: offsetDate(endOffsetDays),
    stato,
    intolleranze: '',
    note_ospite: '',
    recensione_id: null,
    recensione_voto: null,
    recensione_testo: null,
    recensione_visibile: null,
    recensione_stato: null
  };
}

function offsetDate(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
