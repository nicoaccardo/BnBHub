/// <reference types="jasmine" />

import { FormBuilder } from '@angular/forms';
import { Subject, of, throwError } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { PasswordDimenticataPage } from './password-dimenticata.page';

describe('PasswordDimenticataPage', () => {
  it('normalizes the email and shows the generic confirmation', () => {
    const authService = createAuthService();
    const component = createComponent(authService);

    component.resetRequestForm.setValue({ email: '  Utente@Example.COM ' });
    component.onRequestReset();

    expect(authService.requestPasswordReset).toHaveBeenCalledWith('utente@example.com');
    expect(component.successMessage).toContain('riceverai');
    expect(component.isLoading).toBeFalse();
  });

  it('keeps the submit action disabled while the request is pending', () => {
    const pendingRequest = new Subject<unknown>();
    const authService = createAuthService();
    authService.requestPasswordReset.and.returnValue(pendingRequest);
    const component = createComponent(authService);

    component.resetRequestForm.setValue({ email: 'utente@example.com' });
    component.onRequestReset();

    expect(component.isLoading).toBeTrue();

    pendingRequest.next({});
    expect(component.isLoading).toBeFalse();
  });

  it('shows a specific message when the rate limit is reached', () => {
    const authService = createAuthService();
    authService.requestPasswordReset.and.returnValue(
      throwError(() => ({ status: 429 }))
    );
    const component = createComponent(authService);

    component.resetRequestForm.setValue({ email: 'utente@example.com' });
    component.onRequestReset();

    expect(component.errorMessage).toContain('troppe richieste');
  });
});

function createAuthService(): jasmine.SpyObj<AuthService> {
  const authService = jasmine.createSpyObj<AuthService>(
    'AuthService',
    ['requestPasswordReset']
  );
  authService.requestPasswordReset.and.returnValue(of({}));
  return authService;
}

function createComponent(
  authService: jasmine.SpyObj<AuthService>
): PasswordDimenticataPage {
  const component = new PasswordDimenticataPage(new FormBuilder(), authService);
  component.ngOnInit();
  return component;
}
