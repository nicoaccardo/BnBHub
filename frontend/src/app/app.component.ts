import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonRouterLink, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, homeSharp, logInOutline, logInSharp, personAddOutline, personAddSharp, logOutOutline, logOutSharp } from 'ionicons/icons';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterLink, IonRouterOutlet, IonButton],
})
export class AppComponent {

  public appPages = [
    { title: 'Home', url: '/home', icon: 'home' },
    { title: 'Login', url: '/login', icon: 'log-in' },
    { title: 'Registrati', url: '/register', icon: 'person-add' },
  ];

  constructor(public authService: AuthService, private router: Router) {
    addIcons({ homeOutline, homeSharp, logInOutline, logInSharp, personAddOutline, personAddSharp, logOutOutline, logOutSharp });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}