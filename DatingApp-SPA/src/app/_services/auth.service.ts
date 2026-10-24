import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, RegisterRequest, User } from '../_models/user';
import { DecodedToken, decodeToken, isTokenExpired } from './jwt';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
export const DEFAULT_PHOTO = 'assets/user.png';

function readUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') as User | null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl + 'auth/';

  private readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly decodedToken = computed<DecodedToken | null>(() => decodeToken(this.token()));
  readonly currentUser = signal<User | null>(readUser());
  readonly photoUrl = computed(() => this.currentUser()?.photoUrl || DEFAULT_PHOTO);

  /** Id of the logged-in user, or 0 when logged out. */
  get userId(): number {
    return Number(this.decodedToken()?.nameid ?? 0);
  }

  getToken(): string | null {
    return this.token();
  }

  login(model: LoginRequest): Observable<void> {
    return this.http.post<{ token: string; user: User }>(this.baseUrl + 'login', model).pipe(
      map(({ token, user }) => {
        localStorage.setItem(TOKEN_KEY, token);
        this.token.set(token);
        this.setCurrentUser(user);
      }),
    );
  }

  register(user: RegisterRequest): Observable<User> {
    return this.http.post<User>(this.baseUrl + 'register', user);
  }

  loggedIn(): boolean {
    return !isTokenExpired(this.decodedToken());
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
  }

  changeMemberPhoto(photoUrl: string): void {
    const user = this.currentUser();
    if (user) this.setCurrentUser({ ...user, photoUrl });
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }
}
