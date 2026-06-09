/// <reference types="jasmine" />

import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { RegisterPage } from './register.page';

describe('RegisterPage', () => {
  it('preserves the booking return URL when registration completes', () => {
    const authService = jasmine.createSpyObj<AuthService>('AuthService', ['register']);
    authService.register.and.returnValue(of({ id: 1 }));

    const route = {
      snapshot: {
        queryParamMap: convertToParamMap({ returnUrl: '/prenota' })
      }
    } as ActivatedRoute;
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const component = new RegisterPage(new FormBuilder(), authService, route, router);
    component.ngOnInit();
    component.registerForm.setValue({
      nome: 'Mario',
      cognome: 'Rossi',
      email: 'mario.rossi@example.com',
      password: 'Password1',
      eta: 30,
      telefono: '+39 333 1234567',
      codice_fiscale: 'RSSMRA80A01H501U'
    });

    component.onRegister();

    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: {
        returnUrl: '/prenota',
        registrazione: 'success'
      }
    });
  });
});
