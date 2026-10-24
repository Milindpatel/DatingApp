import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/** Turns an HTTP error into a readable message string. Exported for tests. */
export function toErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'Unexpected error';
  if (error.status === 0) return 'Cannot reach the server';
  if (error.status === 401) return 'Unauthorized';

  const appError = error.headers.get('Application-Error');
  if (appError) return appError;

  const body = error.error;
  if (typeof body === 'string' && body) return body;
  if (body && typeof body === 'object') {
    // ASP.NET Core validation problem: { errors: { Field: ['msg'] } }
    const errors = (body as { errors?: Record<string, string[]> }).errors;
    if (errors) return Object.values(errors).flat().join('\n');
    const title = (body as { title?: string }).title;
    if (title) return title;
  }
  return 'Server error';
}

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(catchError((error) => throwError(() => toErrorMessage(error))));
