/// <reference types="jasmine" />

import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  it('returns a standard user to the requested booking page', () => {
    const { component, authService, router } = createComponent('/prenota', false);

    submitValidLogin(component);

    expect(authService.salvaToken).toHaveBeenCalledWith('token');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/prenota');
  });

  it('always sends administrators to their dashboard', () => {
    const { component, router } = createComponent('/prenota', true);

    submitValidLogin(component);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('falls back to home for an unsafe return URL', () => {
    const { component, router } = createComponent('//example.com', false);

    submitValidLogin(component);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
  });

  it('does not navigate when the returned token is invalid', () => {
    const { component, authService, router } = createComponent('/prenota', false);
    authService.isLoggedIn.and.returnValue(false);

    submitValidLogin(component);

    expect(component.errorMessage).toBe('Risposta di autenticazione non valida. Riprova.');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});

function createComponent(returnUrl: string, isAdmin: boolean) {
  const authService = jasmine.createSpyObj<AuthService>('AuthService', [
    'login',
    'salvaToken',
    'isLoggedIn',
    'isAdmin'
  ]);
  authService.login.and.returnValue(of({ token: 'token' }));
  authService.isLoggedIn.and.returnValue(true);
  authService.isAdmin.and.returnValue(isAdmin);

  const route = {
    snapshot: {
      queryParamMap: convertToParamMap({ returnUrl })
    }
  } as ActivatedRoute;
  const router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
  const component = new LoginPage(new FormBuilder(), authService, route, router);
  component.ngOnInit();

  return { component, authService, router };
}

function submitValidLogin(component: LoginPage): void {
  component.loginForm.setValue({
    email: 'utente@example.com',
    password: 'Password1'
  });
  component.onLogin();
}
