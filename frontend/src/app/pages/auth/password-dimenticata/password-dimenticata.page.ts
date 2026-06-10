import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonSpinner,
  IonText
} from '@ionic/angular/standalone';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-password-dimenticata',
  templateUrl: './password-dimenticata.page.html',
  styleUrls: ['./password-dimenticata.page.scss'],
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
export class PasswordDimenticataPage implements OnInit {
  resetRequestForm!: FormGroup;
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.resetRequestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]]
    });
  }

  onRequestReset(): void {
    this.successMessage = '';
    this.errorMessage = '';
    const emailControl = this.resetRequestForm.get('email');
    const email = typeof emailControl?.value === 'string'
      ? emailControl.value.trim().toLowerCase()
      : '';
    emailControl?.setValue(email);

    if (this.resetRequestForm.invalid) {
      this.resetRequestForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.authService.requestPasswordReset(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage =
          'Se l\u2019indirizzo è associato a un account, riceverai un\u2019email con le istruzioni entro pochi minuti.';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.status === 429
          ? 'Hai effettuato troppe richieste. Attendi qualche minuto prima di riprovare.'
          : 'Non è stato possibile inviare la richiesta. Riprova.';
      }
    });
  }
}
