/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { adminGuard, guestGuard, userGuard } from './auth.guard';

describe('userGuard', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', [
      'isLoggedIn',
      'isAdmin',
      'isUser'
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    router = TestBed.inject(Router);
  });

  it('redirects anonymous visitors to login preserving the booking URL', () => {
    authServiceMock.isLoggedIn.and.returnValue(false);

    const result = runGuard('/prenota') as UrlTree;

    expect(router.serializeUrl(result)).toBe('/login?returnUrl=%2Fprenota');
  });

  it('allows standard users', () => {
    authServiceMock.isLoggedIn.and.returnValue(true);
    authServiceMock.isUser.and.returnValue(true);

    expect(runGuard('/prenota')).toBeTrue();
  });

  it('rejects administrators', () => {
    authServiceMock.isLoggedIn.and.returnValue(true);
    authServiceMock.isUser.and.returnValue(false);

    const result = runGuard('/prenota') as UrlTree;

    expect(router.serializeUrl(result)).toBe('/pagina-non-disponibile');
  });

  function runGuard(url: string) {
    return TestBed.runInInjectionContext(() =>
      userGuard(
        {} as ActivatedRouteSnapshot,
        { url } as RouterStateSnapshot
      )
    );
  }
});

describe('adminGuard', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', [
      'isLoggedIn',
      'isAdmin',
      'isUser'
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    router = TestBed.inject(Router);
  });

  it('redirects anonymous visitors to login', () => {
    authServiceMock.isLoggedIn.and.returnValue(false);

    const result = runGuard() as UrlTree;

    expect(router.serializeUrl(result)).toBe('/login');
  });

  it('allows administrators', () => {
    authServiceMock.isLoggedIn.and.returnValue(true);
    authServiceMock.isAdmin.and.returnValue(true);

    expect(runGuard()).toBeTrue();
  });

  it('rejects standard users', () => {
    authServiceMock.isLoggedIn.and.returnValue(true);
    authServiceMock.isAdmin.and.returnValue(false);

    const result = runGuard() as UrlTree;

    expect(router.serializeUrl(result)).toBe('/pagina-non-disponibile');
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      adminGuard(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot
      )
    );
  }
});

describe('guestGuard', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', [
      'isLoggedIn',
      'isAdmin',
      'isUser'
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    router = TestBed.inject(Router);
  });

  it('allows anonymous visitors', () => {
    authServiceMock.isLoggedIn.and.returnValue(false);

    expect(runGuard()).toBeTrue();
  });

  it('redirects administrators to their dashboard', () => {
    authServiceMock.isLoggedIn.and.returnValue(true);
    authServiceMock.isAdmin.and.returnValue(true);

    const result = runGuard() as UrlTree;

    expect(router.serializeUrl(result)).toBe('/admin/dashboard');
  });

  it('redirects standard users to home', () => {
    authServiceMock.isLoggedIn.and.returnValue(true);
    authServiceMock.isAdmin.and.returnValue(false);

    const result = runGuard() as UrlTree;

    expect(router.serializeUrl(result)).toBe('/home');
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      guestGuard(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot
      )
    );
  }
});
