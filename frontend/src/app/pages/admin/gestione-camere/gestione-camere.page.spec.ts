/// <reference types="jasmine" />

import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { Camera, RoomService } from '../../../services/room.service';
import { GestioneCamerePage } from './gestione-camere.page';

describe('GestioneCamerePage', () => {
  let createObjectUrlSpy: jasmine.Spy;
  let revokeObjectUrlSpy: jasmine.Spy;

  beforeEach(() => {
    createObjectUrlSpy = spyOn(URL, 'createObjectURL').and.callFake(
      (file: Blob) => `blob:${file.size}-${Math.random()}`
    );
    revokeObjectUrlSpy = spyOn(URL, 'revokeObjectURL');
  });

  it('keeps selected existing images and appends new files on update', () => {
    const { component, roomService } = createComponent();
    const room = createRoom();
    const newFile = createFile('nuova.png', 'image/png', 1024);

    component.modificaCamera(room);
    component.removeImage(0);
    component.addFiles([newFile]);
    component.salvaCamera();

    const [roomId, payload, keptImageIds, files] =
      roomService.update.calls.mostRecent().args;
    expect(roomId).toBe(room.id);
    expect(payload.nome).toBe(room.nome);
    expect(keptImageIds).toEqual([102]);
    expect(files).toEqual([newFile]);
    expect(component.isToastOpen).toBeTrue();
  });

  it('builds previews across multiple selections and rejects invalid files', () => {
    const { component } = createComponent();
    const validFile = createFile('camera.webp', 'image/webp', 2048);
    const invalidType = createFile('camera.gif', 'image/gif', 2048);
    const oversized = createFile('grande.jpg', 'image/jpeg', 5 * 1024 * 1024 + 1);

    component.addFiles([validFile]);
    component.addFiles([invalidType, oversized]);

    expect(component.imagePreviews.length).toBe(1);
    expect(component.imagePreviews[0].name).toBe('camera.webp');
    expect(component.imageErrorMessage).toContain('supera il limite');
    expect(createObjectUrlSpy).toHaveBeenCalledTimes(1);
  });

  it('requires at least one image before creating a room', () => {
    const { component, roomService } = createComponent();
    component.cameraForm.setValue({
      nome: 'Camera nuova',
      tipo: 'doppia',
      descrizione: '',
      prezzo: 100,
      capienza: 2,
      disponibile: 1
    });

    component.salvaCamera();

    expect(roomService.create).not.toHaveBeenCalled();
    expect(component.imagesTouched).toBeTrue();
  });

  it('revokes local preview URLs when cancelling an edit', () => {
    const { component } = createComponent();
    const file = createFile('camera.jpg', 'image/jpeg', 1024);

    component.modificaCamera(createRoom());
    component.addFiles([file]);
    const newPreviewUrl = component.imagePreviews[2].url;

    component.annullaModifica();

    expect(revokeObjectUrlSpy).toHaveBeenCalledWith(newPreviewUrl);
    expect(component.imagePreviews).toEqual([]);
    expect(component.cameraInModifica).toBeNull();
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

function createRoom(): Camera {
  return {
    id: 3,
    nome: 'Camera 3',
    descrizione: 'Descrizione',
    tipo: 'doppia',
    prezzo: 100,
    capienza: 2,
    disponibile: 1,
    immagine_url: 'http://localhost:3000/uploads/rooms/3/one.webp',
    immagini_url: [
      'http://localhost:3000/uploads/rooms/3/one.webp',
      'http://localhost:3000/uploads/rooms/3/two.webp'
    ],
    immagini: [
      {
        id: 101,
        url: 'http://localhost:3000/uploads/rooms/3/one.webp',
        ordine: 0
      },
      {
        id: 102,
        url: 'http://localhost:3000/uploads/rooms/3/two.webp',
        ordine: 1
      }
    ]
  };
}

function createFile(name: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type });
}
