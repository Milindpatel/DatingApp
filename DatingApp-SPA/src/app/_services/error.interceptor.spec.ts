import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { toErrorMessage } from './error.interceptor';

describe('toErrorMessage', () => {
  const err = (init: ConstructorParameters<typeof HttpErrorResponse>[0]) => new HttpErrorResponse(init);

  it('handles network failures and 401', () => {
    expect(toErrorMessage(err({ status: 0 }))).toBe('Cannot reach the server');
    expect(toErrorMessage(err({ status: 401 }))).toBe('Unauthorized');
  });

  it('prefers the Application-Error header', () => {
    const headers = new HttpHeaders({ 'Application-Error': 'boom' });
    expect(toErrorMessage(err({ status: 500, headers, error: 'ignored' }))).toBe('boom');
  });

  it('returns plain string bodies', () => {
    expect(toErrorMessage(err({ status: 400, error: 'Username already exists' }))).toBe('Username already exists');
  });

  it('flattens ASP.NET validation errors', () => {
    const error = { title: 'One or more validation errors occurred.', errors: { Username: ['Required'], City: ['Required too'] } };
    expect(toErrorMessage(err({ status: 400, error }))).toBe('Required\nRequired too');
  });

  it('falls back to a generic message', () => {
    expect(toErrorMessage(err({ status: 500 }))).toBe('Server error');
    expect(toErrorMessage(new Error('x'))).toBe('Unexpected error');
  });
});
