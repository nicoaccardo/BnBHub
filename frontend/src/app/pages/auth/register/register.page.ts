import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { IonContent, IonItem, IonInput, IonButton, IonText } from '@ionic/angular/standalone';

const NAME_PATTERN = "^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$";
const PHONE_PATTERN = '^\\+?[0-9 .()-]{8,20}$';
const CODICE_FISCALE_PATTERN = '^[A-Za-z]{6}[0-9]{2}[A-Za-z][0-9]{2}[A-Za-z][0-9]{3}[A-Za-z]$';
const PASSWORD_PATTERN = '^(?=.*[A-Za-z])(?=.*\\d).+$';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, IonContent, IonItem, IonInput, IonButton, IonText]
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  duplicateEmail: boolean = false;
  returnUrl: string = '/home';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40), Validators.pattern(NAME_PATTERN)]],
      cognome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40), Validators.pattern(NAME_PATTERN)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(64), Validators.pattern(PASSWORD_PATTERN)]],
      eta: ['', [Validators.required, Validators.min(18), Validators.max(120), Validators.pattern('^[0-9]*$')]],
      telefono: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      codice_fiscale: ['', [Validators.required, Validators.pattern(CODICE_FISCALE_PATTERN)]]
    });

    this.returnUrl = this.getSafeReturnUrl('/home');
  }

  onRegister() {
    this.successMessage = '';
    this.errorMessage = '';
    this.duplicateEmail = false;

    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      const userData = {
        ...formValue,
        nome: formValue.nome.trim(),
        cognome: formValue.cognome.trim(),
        email: formValue.email.trim().toLowerCase(),
        telefono: formValue.telefono.trim(),
        codice_fiscale: formValue.codice_fiscale.trim().toUpperCase()
      };

      this.authService.register(userData).subscribe({
        next: () => {
          this.successMessage = 'Registrazione completata! Ti abbiamo inviato una mail di conferma.';
          this.registerForm.reset();
          this.router.navigate(['/login'], {
            queryParams: {
              returnUrl: this.returnUrl,
              registrazione: 'success'
            }
          });
        },
        error: (err) => {
          const errorCode = err.error?.codice;

          if (errorCode === 'EMAIL_GIA_REGISTRATA') {
            this.duplicateEmail = true;
            this.errorMessage = 'Questa email risulta gia registrata.';
            this.registerForm.get('email')?.setErrors({ duplicate: true });
            this.registerForm.get('email')?.markAsTouched();
            return;
          }

          if (errorCode === 'CODICE_FISCALE_GIA_REGISTRATO') {
            this.errorMessage = 'Questo codice fiscale risulta gia associato a un altro account.';
            this.registerForm.get('codice_fiscale')?.setErrors({ duplicate: true });
            this.registerForm.get('codice_fiscale')?.markAsTouched();
            return;
          }

          this.errorMessage = 'Errore durante la registrazione. Riprova.';
          console.error(err);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);

    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return 'Campo obbligatorio.';
    }

    if (field.errors['email']) {
      return 'Inserisci un indirizzo email valido.';
    }

    if (field.errors['duplicate']) {
      const messages: Record<string, string> = {
        email: 'Email gia registrata.',
        codice_fiscale: 'Codice fiscale gia associato a un altro account.'
      };

      return messages[fieldName] || 'Valore gia presente.';
    }

    if (field.errors['minlength']) {
      return `Inserisci almeno ${field.errors['minlength'].requiredLength} caratteri.`;
    }

    if (field.errors['maxlength']) {
      return `Inserisci al massimo ${field.errors['maxlength'].requiredLength} caratteri.`;
    }

    if (field.errors['min'] || field.errors['max']) {
      return 'Inserisci un valore compreso tra 18 e 120.';
    }

    if (field.errors['pattern']) {
      const messages: Record<string, string> = {
        nome: 'Usa solo lettere, spazi, apostrofi o trattini.',
        cognome: 'Usa solo lettere, spazi, apostrofi o trattini.',
        password: 'La password deve contenere almeno una lettera e un numero.',
        eta: 'Inserisci solo numeri.',
        telefono: 'Inserisci un numero di telefono valido.',
        codice_fiscale: 'Inserisci un codice fiscale italiano valido di 16 caratteri.'
      };

      return messages[fieldName] || 'Valore non valido.';
    }

    return 'Valore non valido.';
  }

  private getSafeReturnUrl(fallback: string): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    return returnUrl?.startsWith('/') ? returnUrl : fallback;
  }
}
