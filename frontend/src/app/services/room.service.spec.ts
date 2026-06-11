/// <reference types="jasmine" />

import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { CameraPayload, RoomService } from './room.service';

describe('RoomService', () => {
  it('sends room creation as multipart form data', () => {
    const { service, httpClient } = createService();
    const payload = createPayload();
    const file = new File(['image'], 'camera.jpg', { type: 'image/jpeg' });

    service.create(payload, [file]).subscribe();

    const [, body] = httpClient.post.calls.mostRecent().args;
    const formData = body as FormData;
    expect(JSON.parse(formData.get('camera') as string)).toEqual(payload);
    expect(formData.getAll('immagini')).toEqual([file]);
  });

  it('includes kept image ids in room update form data', () => {
    const { service, httpClient } = createService();
    const payload = createPayload();
    const file = new File(['image'], 'camera.webp', { type: 'image/webp' });

    service.update(7, payload, [11, 12], [file]).subscribe();

    const [, body] = httpClient.put.calls.mostRecent().args;
    const formData = body as FormData;
    expect(JSON.parse(formData.get('camera') as string)).toEqual({
      ...payload,
      immagini_mantenute: [11, 12]
    });
    expect(formData.getAll('immagini')).toEqual([file]);
  });
});

function createService() {
  const httpClient = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'post',
    'put'
  ]);
  const authService = jasmine.createSpyObj<AuthService>('AuthService', ['getToken']);
  httpClient.post.and.returnValue(of({}));
  httpClient.put.and.returnValue(of({}));
  authService.getToken.and.returnValue('token');

  return {
    service: new RoomService(httpClient, authService),
    httpClient
  };
}

function createPayload(): CameraPayload {
  return {
    nome: 'Camera test',
    descrizione: 'Descrizione',
    tipo: 'doppia',
    prezzo: 100,
    capienza: 2,
    disponibile: 1
  };
}
