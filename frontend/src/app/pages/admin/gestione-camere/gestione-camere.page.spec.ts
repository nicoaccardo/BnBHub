/// <reference types="jasmine" />

import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { Camera, RoomService } from '../../../services/room.service';
import { GestioneCamerePage } from './gestione-camere.page';

describe('GestioneCamerePage', () => {
  it('recreates image controls when switching between rooms', () => {
    const { component } = createComponent();

    component.modificaCamera(createRoom(1, [
      'https://example.com/room-1-main.jpg',
      'https://example.com/room-1-detail.jpg'
    ]));
    const previousFirstControl = component.immaginiUrl.at(0);

    component.modificaCamera(createRoom(2, [
      'https://example.com/room-2-main.jpg'
    ]));

    expect(component.immaginiUrl.at(0)).not.toBe(previousFirstControl);
    expect(component.immaginiUrl.getRawValue()).toEqual([
      'https://example.com/room-2-main.jpg'
    ]);
  });

  it('sends the edited first URL as the main room image', () => {
    const { component, roomService } = createComponent();
    const room = createRoom(3, [
      'https://example.com/old-main.jpg',
      'https://example.com/detail.jpg'
    ]);

    component.modificaCamera(room);
    component.immaginiUrl.at(0).setValue('https://images.unsplash.com/photo-main?auto=format');
    component.salvaCamera();

    const [, payload] = roomService.update.calls.mostRecent().args;
    expect(payload.immagini_url).toEqual([
      'https://images.unsplash.com/photo-main?auto=format',
      'https://example.com/detail.jpg'
    ]);
  });

  it('keeps the remaining image controls aligned after a removal', () => {
    const { component } = createComponent();

    component.immaginiUrl.at(0).setValue('https://example.com/main.jpg');
    component.aggiungiImmagine();
    component.aggiungiImmagine();
    component.immaginiUrl.at(1).setValue('https://example.com/remove.jpg');
    component.immaginiUrl.at(2).setValue('https://example.com/keep.jpg');

    component.rimuoviImmagine(1);

    expect(component.immaginiUrl.getRawValue()).toEqual([
      'https://example.com/main.jpg',
      'https://example.com/keep.jpg'
    ]);
  });

  it('accepts direct Unsplash CDN image URLs', () => {
    const { component } = createComponent();
    const control = component.immaginiUrl.at(0);

    control.setValue('https://images.unsplash.com/photo-123?auto=format&fit=crop&w=900');

    expect(control.valid).toBeTrue();
  });

  it('rejects Unsplash page URLs, malformed URLs and unsupported protocols', () => {
    const { component } = createComponent();
    const control = component.immaginiUrl.at(0);

    control.setValue('https://unsplash.com/it/foto/camera-p3UWyaujtQo');
    expect(control.hasError('unsplashPageUrl')).toBeTrue();

    control.setValue('not-an-url');
    expect(control.hasError('invalidImageUrl')).toBeTrue();

    control.setValue('ftp://example.com/room.jpg');
    expect(control.hasError('invalidImageUrl')).toBeTrue();
  });
});

function createComponent() {
  const roomService = jasmine.createSpyObj<RoomService>('RoomService', [
    'getAll',
    'create',
    'update',
    'delete'
  ]);
  roomService.getAll.and.returnValue(of([]));
  roomService.create.and.returnValue(of({ messaggio: 'Camera creata' }));
  roomService.update.and.returnValue(of({ messaggio: 'Camera aggiornata' }));
  roomService.delete.and.returnValue(of({ messaggio: 'Camera eliminata' }));

  const component = new GestioneCamerePage(new FormBuilder(), roomService);
  component.ngOnInit();

  return { component, roomService };
}

function createRoom(id: number, immaginiUrl: string[]): Camera {
  return {
    id,
    nome: `Camera ${id}`,
    descrizione: 'Descrizione',
    tipo: 'doppia',
    prezzo: 100,
    capienza: 2,
    disponibile: 1,
    immagine_url: immaginiUrl[0] || null,
    immagini_url: immaginiUrl
  };
}
