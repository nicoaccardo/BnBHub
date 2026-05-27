import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { IonContent, IonItem, IonInput, IonButton, IonText } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, IonContent, IonItem, IonInput, IonButton, IonText]
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  returnUrl: string = '/home';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.returnUrl = this.getSafeReturnUrl('/home');

    if (this.route.snapshot.queryParamMap.get('registrazione') === 'success') {
      this.successMessage = 'Registrazione completata. Accedi per continuare con la prenotazione.';
    }
  }

  onLogin() {
    this.errorMessage = '';
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.authService.salvaToken(response.token);
          const fallback = this.authService.isAdmin() ? '/admin/dashboard' : '/home';
          const destinazione = this.getSafeReturnUrl(fallback);
          this.router.navigateByUrl(destinazione);
        },
        error: (err) => {
          this.errorMessage = 'Credenziali non valide. Riprova.';
          console.error(err);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  private getSafeReturnUrl(fallback: string): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    return returnUrl?.startsWith('/') ? returnUrl : fallback;
  }
}
