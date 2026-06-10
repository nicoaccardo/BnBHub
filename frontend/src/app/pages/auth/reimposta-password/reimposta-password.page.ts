import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonSpinner,
  IonText
} from '@ionic/angular/standalone';
import { AuthService } from '../../../services/auth.service';

const PASSWORD_PATTERN = '^(?=.*[A-Za-z])(?=.*\\d).+$';
const TOKEN_PATTERN = /^[a-f0-9]{64}$/i;

const matchingPasswordsValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  return password && confirmPassword && password !== confirmPassword
    ? { passwordsMismatch: true }
    : null;
};

@Component({
  selector: 'app-reimposta-password',
  templateUrl: './reimposta-password.page.html',
  styleUrls: ['./reimposta-password.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    IonButton,
    IonContent,
    IonInput,
    IonItem,
    IonSpinner,
    IonText
  ]
})
export class ReimpostaPasswordPage implements OnInit {
  resetPasswordForm!: FormGroup;
  errorMessage = '';
  isLoading = false;
  invalidToken = false;
  private token = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token')?.trim() || '';
    this.invalidToken = !TOKEN_PATTERN.test(this.token);

    this.resetPasswordForm = this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(64),
            Validators.pattern(PASSWORD_PATTERN)
          ]
        ],
        confirmPassword: ['', Validators.required]
      },
      { validators: matchingPasswordsValidator }
    );

    if (this.invalidToken) {
      this.errorMessage = 'Il link di recupero non è valido. Richiedine uno nuovo.';
    }
  }

  onResetPassword(): void {
    this.errorMessage = '';

    if (this.invalidToken) {
      this.errorMessage = 'Il link di recupero non è valido. Richiedine uno nuovo.';
      return;
    }

    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const password = this.resetPasswordForm.value.password;

    this.authService.resetPassword(this.token, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login'], {
          queryParams: { passwordReset: 'success' }
        });
      },
      error: (error) => {
        this.isLoading = false;

        if (
          error.status === 400 &&
          error.error?.codice === 'TOKEN_RESET_NON_VALIDO'
        ) {
          this.invalidToken = true;
          this.errorMessage =
            'Il link di recupero non è valido, è scaduto oppure è già stato utilizzato.';
          return;
        }

        this.errorMessage = 'Non è stato possibile reimpostare la password. Riprova.';
      }
    });
  }

  getPasswordError(): string {
    const password = this.resetPasswordForm.get('password');

    if (!password?.touched || !password.errors) {
      return '';
    }

    if (password.errors['required']) {
      return 'La password è obbligatoria.';
    }

    if (password.errors['minlength']) {
      return 'La password deve avere almeno 6 caratteri.';
    }

    if (password.errors['maxlength']) {
      return 'La password non può superare 64 caratteri.';
    }

    return 'La password deve contenere almeno una lettera e un numero.';
  }
}
