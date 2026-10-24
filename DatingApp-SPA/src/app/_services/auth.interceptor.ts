import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

/** Adds the bearer token to API calls (except login/register). */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  const isApi = req.url.startsWith(environment.apiUrl);
  const isAuthCall = req.url.startsWith(environment.apiUrl + 'auth/');
  if (token && isApi && !isAuthCall) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
