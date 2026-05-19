import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonText, IonButtons, IonBackButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonText, IonButtons, IonBackButton]
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      eta: ['', [Validators.required, Validators.min(1), Validators.pattern('^[0-9]*$')]],
      telefono: ['', Validators.required],
      codice_fiscale: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16)]]
    });
  }

  onRegister() {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.successMessage = 'Registrazione completata! Controlla la tua email per verificare l\'account.';
          this.registerForm.reset();
        },
        error: (err) => {
          this.errorMessage = 'Errore durante la registrazione. Riprova.';
          console.error(err);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}