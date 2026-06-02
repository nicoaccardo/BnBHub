import { Component, OnInit } from '@angular/core';
import {
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonSpinner,
  IonText
} from '@ionic/angular/standalone';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-gestione-utenti',
  templateUrl: './gestione-utenti.page.html',
  styleUrls: ['./gestione-utenti.page.scss'],
  standalone: true,
  imports: [
    IonBadge,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonSpinner,
    IonText
  ]
})
export class GestioneUtentiPage implements OnInit {
  utenti: any[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.caricaUtenti();
  }

  caricaUtenti() {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getAll().subscribe({
      next: (utenti) => {
        this.utenti = utenti;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Errore durante il caricamento degli utenti.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  ruoloColor(ruolo: string): string {
    return ruolo === 'admin' ? 'primary' : 'medium';
  }
}
