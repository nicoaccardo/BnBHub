import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
  IonPopover,
  IonRouterLink,
  IonRouterOutlet,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, homeSharp, logInOutline, logInSharp, logOutOutline, logOutSharp, chevronDownOutline, personCircleOutline, personCircleSharp } from 'ionicons/icons';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { gridOutline, gridSharp, bedOutline, bedSharp, calendarOutline, calendarSharp, peopleOutline, peopleSharp, starOutline, starSharp } from 'ionicons/icons';

interface NavPage {
  title: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonMenu,
    IonMenuButton,
    IonMenuToggle,
    IonPopover,
    IonRouterLink,
    IonRouterOutlet,
    IonToolbar
  ]
})
export class AppComponent {
  isHomePage = false;
  navbarScrolled = false;

  public appPages: NavPage[] = [
    { title: 'Home', url: '/home', icon: 'home' },
  ];

  public homeSectionLinks = [
    { title: 'Galleria', fragment: 'galleria' },
    { title: 'Servizi', fragment: 'servizi' },
    { title: 'Recensioni', fragment: 'recensioni' },
    { title: 'Dove siamo', fragment: 'dove-siamo' },
  ];

  public guestPages: NavPage[] = [
    { title: 'Prenota', url: '/prenota', icon: 'calendar' },
    { title: 'Login', url: '/login', icon: 'log-in' },
  ];

  public userPages: NavPage[] = [
    { title: 'Area personale', url: '/area-personale', icon: 'person-circle' },
    { title: 'Prenota', url: '/prenota', icon: 'calendar' },
  ];

  public adminPages: NavPage[] = [
    { title: 'Dashboard', url: '/admin/dashboard', icon: 'grid' },
    { title: 'Camere', url: '/admin/gestione-camere', icon: 'bed' },
    { title: 'Prenotazioni', url: '/admin/gestione-prenotazioni', icon: 'calendar' },
    { title: 'Recensioni', url: '/admin/gestione-recensioni', icon: 'star' },
    { title: 'Utenti', url: '/admin/gestione-utenti', icon: 'people' },
  ];

  constructor(public authService: AuthService, private router: Router) {
    addIcons({ homeOutline, homeSharp, logInOutline, logInSharp, logOutOutline, logOutSharp, chevronDownOutline, personCircleOutline, personCircleSharp, gridOutline, gridSharp, bedOutline, bedSharp, calendarOutline, calendarSharp, peopleOutline, peopleSharp, starOutline, starSharp });

    this.updateRouteState(this.router.url);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateRouteState(event.urlAfterRedirects);
      }
    });
  }

  get navbarClass() {
    return {
      'app-navbar': true,
      'navbar-transparent': this.isHomePage && !this.navbarScrolled,
      'navbar-solid': !this.isHomePage || this.navbarScrolled
    };
  }

  @HostListener('window:bnbhub-home-scroll', ['$event'])
  onHomeScroll(event: CustomEvent<number>) {
    this.navbarScrolled = event.detail > 24;
  }

  navigateToHomeSection(fragment: string) {
    if (!this.isHomePage) {
      this.router.navigate(['/home']).then(() => {
        setTimeout(() => this.requestHomeSectionScroll(fragment), 150);
      });
      return;
    }

    this.requestHomeSectionScroll(fragment);
  }

  navigateToHomeTop() {
    if (!this.isHomePage) {
      this.router.navigate(['/home']).then(() => {
        setTimeout(() => this.requestHomeTopScroll(), 150);
      });
      return;
    }

    this.requestHomeTopScroll();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private updateRouteState(url: string) {
    this.isHomePage = url.startsWith('/home') || url === '/';
    this.navbarScrolled = !this.isHomePage;
  }

  private requestHomeSectionScroll(fragment: string) {
    window.dispatchEvent(new CustomEvent('bnbhub-scroll-section', { detail: fragment }));
  }

  private requestHomeTopScroll() {
    window.dispatchEvent(new CustomEvent('bnbhub-scroll-top'));
  }

}
