/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';

describe('AppComponent', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', [
      'isLoggedIn',
      'isAdmin',
      'logout'
    ]);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    authServiceMock.isLoggedIn.and.returnValue(false);
    authServiceMock.isAdmin.and.returnValue(false);

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
  });

  it('should show guest actions when the user is not logged in', () => {
    authServiceMock.isLoggedIn.and.returnValue(false);
    authServiceMock.isAdmin.and.returnValue(false);

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.nativeElement;
    const authNav = app.querySelector('.auth-nav');
    const mobileMenu = app.querySelector('ion-menu.mobile-menu');
    const component = fixture.componentInstance;
    const bookingLink = component.guestPages.find((page) => page.title === 'Prenota ora');

    expect(authNav.textContent).toContain('Login');
    expect(authNav.textContent).toContain('Registrati');
    expect(authNav.textContent).not.toContain('Area admin');
    expect(authNav.textContent).not.toContain('Logout');
    expect(mobileMenu.textContent).toContain('Login');
    expect(mobileMenu.textContent).toContain('Registrati');
    expect(mobileMenu.textContent).toContain('Prenota ora');
    expect(bookingLink?.queryParams).toEqual({ returnUrl: '/prenota' });
  });

  it('should show user booking actions when a standard user is logged in', () => {
    authServiceMock.isLoggedIn.and.returnValue(true);
    authServiceMock.isAdmin.and.returnValue(false);

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.nativeElement;
    const authNav = app.querySelector('.auth-nav');
    const mobileMenu = app.querySelector('ion-menu.mobile-menu');
    const profileButton = app.querySelector('.profile-nav-button');

    expect(profileButton).not.toBeNull();
    expect(profileButton.getAttribute('aria-label')).toBe('Area personale');
    expect(authNav.textContent).not.toContain('Area personale');
    expect(authNav.textContent).toContain('Prenota');
    expect(authNav.textContent).toContain('Logout');
    expect(authNav.textContent).not.toContain('Login');
    expect(mobileMenu.textContent).toContain('Area personale');
    expect(mobileMenu.textContent).toContain('Prenota');
    expect(mobileMenu.textContent).toContain('Logout');
  });

  it('should expose admin navigation when an admin is logged in', () => {
    authServiceMock.isLoggedIn.and.returnValue(true);
    authServiceMock.isAdmin.and.returnValue(true);

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.nativeElement;
    const authNav = app.querySelector('.auth-nav');
    const mobileMenu = app.querySelector('ion-menu.mobile-menu');
    const adminPopover = app.querySelector('ion-popover.admin-popover');
    const component = fixture.componentInstance;

    expect(authNav.textContent).toContain('Area admin');
    expect(authNav.textContent).toContain('Logout');
    expect(authNav.textContent).not.toContain('Login');
    expect(mobileMenu.textContent).toContain('Area admin');
    expect(mobileMenu.textContent).toContain('Dashboard');
    expect(mobileMenu.textContent).toContain('Camere');
    expect(mobileMenu.textContent).toContain('Prenotazioni');
    expect(mobileMenu.textContent).toContain('Recensioni');
    expect(mobileMenu.textContent).toContain('Utenti');
    expect(mobileMenu.textContent).toContain('Logout');
    expect(adminPopover).not.toBeNull();
    expect(component.adminPages.map((page) => page.title)).toEqual([
      'Dashboard',
      'Camere',
      'Prenotazioni',
      'Recensioni',
      'Utenti'
    ]);
  });
});
