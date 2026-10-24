import { FormControl, FormGroup } from '@angular/forms';
import { passwordMatchValidator } from './register.component';

describe('passwordMatchValidator', () => {
  const group = (password: string, confirmPassword: string) =>
    new FormGroup({ password: new FormControl(password), confirmPassword: new FormControl(confirmPassword) });

  it('passes when passwords match', () => {
    expect(passwordMatchValidator(group('secret123', 'secret123'))).toBeNull();
  });

  it('flags a mismatch', () => {
    expect(passwordMatchValidator(group('secret123', 'secret124'))).toEqual({ mismatch: true });
  });
});
