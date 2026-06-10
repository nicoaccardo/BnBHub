/// <reference types="jasmine" />

import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ReimpostaPasswordPage } from './reimposta-password.page';

describe('ReimpostaPasswordPage', () => {
  const validToken = 'a'.repeat(64);

  it('does not submit when the passwords do not match', () => {
    const { component, authService } = createComponent(validToken);

    component.resetPasswordForm.setValue({
      password: 'Password1',
      confirmPassword: 'Password2'
    });
    component.onResetPassword();

    expect(component.resetPasswordForm.hasError('passwordsMismatch')).toBeTrue();
    expect(authService.resetPassword).not.toHaveBeenCalled();
  });

  it('returns to login after a successful reset', () => {
    const { component, authService, router } = createComponent(validToken);

    component.resetPasswordForm.setValue({
      password: 'NuovaPassword1',
      confirmPassword: 'NuovaPassword1'
    });
    component.onResetPassword();

    expect(authService.resetPassword).toHaveBeenCalledWith(
      validToken,
      'NuovaPassword1'
    );
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { passwordReset: 'success' }
    });
  });

  it('blocks a page opened without a valid token', () => {
    const { component, authService } = createComponent('invalid');

    expect(component.invalidToken).toBeTrue();

    component.onResetPassword();
    expect(authService.resetPassword).not.toHaveBeenCalled();
  });

  it('offers a new request when the token is expired or already used', () => {
    const { component, authService } = createComponent(validToken);
    authService.resetPassword.and.returnValue(
      throwError(() => ({
        status: 400,
        error: { codice: 'TOKEN_RESET_NON_VALIDO' }
      }))
    );

    component.resetPasswordForm.setValue({
      password: 'NuovaPassword1',
      confirmPassword: 'NuovaPassword1'
    });
    component.onResetPassword();

    expect(component.invalidToken).toBeTrue();
    expect(component.errorMessage).toContain('scaduto');
  });
});

function createComponent(token: string) {
  const authService = jasmine.createSpyObj<AuthService>('AuthService', ['resetPassword']);
  authService.resetPassword.and.returnValue(of({}));
  const route = {
    snapshot: {
      queryParamMap: convertToParamMap({ token })
    }
  } as ActivatedRoute;
  const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
  const component = new ReimpostaPasswordPage(
    new FormBuilder(),
    authService,
    route,
    router
  );
  component.ngOnInit();

  return { component, authService, router };
}
