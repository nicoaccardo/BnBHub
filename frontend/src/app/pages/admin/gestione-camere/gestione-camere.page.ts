import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-gestione-camere',
  templateUrl: './gestione-camere.page.html',
  styleUrls: ['./gestione-camere.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent]
})
export class GestioneCamerePage {}