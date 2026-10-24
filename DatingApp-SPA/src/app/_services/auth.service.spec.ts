import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { authInterceptor } from './auth.interceptor';
import { AuthService, DEFAULT_PHOTO } from './auth.service';

const future = Math.floor(Date.now() / 1000) + 3600;
const token = `h.${btoa(JSON.stringify({ nameid: '3', unique_name: 'kim', exp: future }))}.s`;
const user = { id: 3, username: 'kim', knownAs: 'Kim', photoUrl: 'kim.jpg' };

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('starts logged out with the default photo', () => {
    expect(service.loggedIn()).toBe(false);
    expect(service.userId).toBe(0);
    expect(service.photoUrl()).toBe(DEFAULT_PHOTO);
  });

  it('stores the token and user on login', () => {
    service.login({ username: 'kim', password: 'password' }).subscribe();
    const req = http.expectOne(environment.apiUrl + 'auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ token, user });

    expect(service.loggedIn()).toBe(true);
    expect(service.userId).toBe(3);
    expect(service.photoUrl()).toBe('kim.jpg');
    expect(localStorage.getItem('token')).toBe(token);
  });

  it('adds the bearer token to API calls after login', () => {
    service.login({ username: 'kim', password: 'password' }).subscribe();
    http.expectOne(environment.apiUrl + 'auth/login').flush({ token, user });

    TestBed.inject(HttpClient).get(environment.apiUrl + 'users').subscribe();
    expect(http.expectOne(environment.apiUrl + 'users').request.headers.get('Authorization')).toBe(`Bearer ${token}`);

    TestBed.inject(HttpClient).get('https://example.com/other').subscribe();
    expect(http.expectOne('https://example.com/other').request.headers.has('Authorization')).toBe(false);
  });

  it('updates the photo and clears everything on logout', () => {
    service.login({ username: 'kim', password: 'password' }).subscribe();
    http.expectOne(environment.apiUrl + 'auth/login').flush({ token, user });

    service.changeMemberPhoto('new.jpg');
    expect(service.photoUrl()).toBe('new.jpg');
    expect(JSON.parse(localStorage.getItem('user')!).photoUrl).toBe('new.jpg');

    service.logout();
    expect(service.loggedIn()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });
});
