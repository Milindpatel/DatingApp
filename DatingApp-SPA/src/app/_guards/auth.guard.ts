import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AlertifyService } from '../_services/alertify.service';
import { AuthService } from '../_services/auth.service';

export const authGuard: CanActivateFn = () => {
  if (inject(AuthService).loggedIn()) return true;
  inject(AlertifyService).error('Please log in first');
  return inject(Router).createUrlTree(['/']);
};
