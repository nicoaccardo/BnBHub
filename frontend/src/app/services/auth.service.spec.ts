/// <reference types="jasmine" />

import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpClient: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    localStorage.clear();
    httpClient = jasmine.createSpyObj<HttpClient>('HttpClient', ['post']);
    httpClient.post.and.returnValue(of({}));
    service = new AuthService(httpClient);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('accepts a valid user token', () => {
    const token = createToken({
      id: 7,
      ruolo: 'user',
      exp: Math.floor(Date.now() / 1000) + 3600
    });

    service.salvaToken(token);

    expect(service.getToken()).toBe(token);
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.isUser()).toBeTrue();
    expect(service.isAdmin()).toBeFalse();
  });

  it('removes an expired token', () => {
    const token = createToken({
      id: 7,
      ruolo: 'user',
      exp: Math.floor(Date.now() / 1000) - 1
    });
    localStorage.setItem('token', token);

    expect(service.isLoggedIn()).toBeFalse();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('removes malformed tokens', () => {
    localStorage.setItem('token', 'not-a-jwt');

    expect(service.getToken()).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('rejects tokens without a supported role', () => {
    const token = createToken({
      id: 7,
      ruolo: 'editor',
      exp: Math.floor(Date.now() / 1000) + 3600
    });

    service.salvaToken(token);

    expect(service.isLoggedIn()).toBeFalse();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('rejects tokens with an unexpected signing algorithm', () => {
    const token = createToken(
      {
        id: 7,
        ruolo: 'user',
        exp: Math.floor(Date.now() / 1000) + 3600
      },
      { alg: 'none', typ: 'JWT' }
    );

    service.salvaToken(token);

    expect(service.isLoggedIn()).toBeFalse();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('requests a password reset with the supplied email', () => {
    service.requestPasswordReset('utente@example.com').subscribe();

    expect(httpClient.post).toHaveBeenCalledWith(
      'http://localhost:3000/auth/password-reset/request',
      { email: 'utente@example.com' }
    );
  });

  it('confirms a password reset with token and new password', () => {
    service.resetPassword('token', 'Password1').subscribe();

    expect(httpClient.post).toHaveBeenCalledWith(
      'http://localhost:3000/auth/password-reset/confirm',
      { token: 'token', password: 'Password1' }
    );
  });
});

function createToken(
  payload: object,
  header: object = { alg: 'HS256', typ: 'JWT' }
): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  return `${encode(header)}.${encode(payload)}.signature`;
}
