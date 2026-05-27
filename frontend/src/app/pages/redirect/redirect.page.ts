import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.page.html',
  styleUrls: ['./redirect.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonIcon]
})
export class RedirectPage {
  constructor(private router: Router) {
    addIcons({ homeOutline });
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
