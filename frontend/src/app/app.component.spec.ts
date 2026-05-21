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

    expect(authNav.textContent).toContain('Login');
    expect(authNav.textContent).toContain('Registrati');
    expect(authNav.textContent).not.toContain('Area admin');
    expect(authNav.textContent).not.toContain('Logout');
  });

  it('should expose admin navigation when an admin is logged in', () => {
    authServiceMock.isLoggedIn.and.returnValue(true);
    authServiceMock.isAdmin.and.returnValue(true);

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.nativeElement;
    const authNav = app.querySelector('.auth-nav');
    const adminPopover = app.querySelector('ion-popover.admin-popover');
    const component = fixture.componentInstance;

    expect(authNav.textContent).toContain('Area admin');
    expect(authNav.textContent).toContain('Logout');
    expect(authNav.textContent).not.toContain('Login');
    expect(adminPopover).not.toBeNull();
    expect(component.adminPages.map((page) => page.title)).toEqual([
      'Dashboard',
      'Camere',
      'Prenotazioni',
      'Utenti'
    ]);
  });
});
