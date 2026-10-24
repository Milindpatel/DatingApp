import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Photo } from '../_models/photo';
import { User } from '../_models/user';

export type UserUpdate = Pick<User, 'introduction' | 'lookingFor' | 'interests' | 'city' | 'country'>;

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}users`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}users/${id}`);
  }

  updateUser(id: number, user: UserUpdate): Observable<void> {
    const { introduction, lookingFor, interests, city, country } = user;
    return this.http.put<void>(`${this.baseUrl}users/${id}`, { introduction, lookingFor, interests, city, country });
  }

  uploadPhoto(userId: number, file: File): Observable<HttpEvent<Photo>> {
    const body = new FormData();
    body.append('file', file, file.name);
    return this.http.post<Photo>(`${this.baseUrl}users/${userId}/photos`, body, {
      reportProgress: true,
      observe: 'events',
    });
  }

  setMainPhoto(userId: number, id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}users/${userId}/photos/${id}/setMain`, {});
  }

  deletePhoto(userId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}users/${userId}/photos/${id}`);
  }
}
