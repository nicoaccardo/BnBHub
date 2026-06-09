/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { userGuard } from './auth.guard';

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
