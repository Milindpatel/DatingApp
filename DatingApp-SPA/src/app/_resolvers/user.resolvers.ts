import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { OperatorFunction, catchError, of } from 'rxjs';
import { User } from '../_models/user';
import { AlertifyService } from '../_services/alertify.service';
import { AuthService } from '../_services/auth.service';
import { UserService } from '../_services/user.service';

function onError<T>(fallback: string): OperatorFunction<T, T | RedirectCommand> {
  const alertify = inject(AlertifyService);
  const router = inject(Router);
  return catchError(() => {
    alertify.error('Problem retrieving data');
    return of(new RedirectCommand(router.parseUrl(fallback)));
  });
}

export const memberListResolver: ResolveFn<User[]> = () =>
  inject(UserService).getUsers().pipe(onError<User[]>('/'));

export const memberDetailResolver: ResolveFn<User> = (route) =>
  inject(UserService).getUser(Number(route.paramMap.get('id'))).pipe(onError<User>('/members'));

export const memberEditResolver: ResolveFn<User> = () =>
  inject(UserService).getUser(inject(AuthService).userId).pipe(onError<User>('/members'));
