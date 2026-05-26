import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'prenota',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/prenota/prenota.page').then((m) => m.PrenotaPage),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'gestione-camere',
        loadComponent: () =>
          import('./pages/admin/gestione-camere/gestione-camere.page').then((m) => m.GestioneCamerePage),
      },
      {
        path: 'gestione-prenotazioni',
        loadComponent: () =>
          import('./pages/admin/gestione-prenotazioni/gestione-prenotazioni.page').then((m) => m.GestionePrenotazioniPage),
      },
      {
        path: 'gestione-utenti',
        loadComponent: () =>
          import('./pages/admin/gestione-utenti/gestione-utenti.page').then((m) => m.GestioneUtentiPage),
      },
    ]
  },
];
