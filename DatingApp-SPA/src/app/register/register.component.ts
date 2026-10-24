import { NgClass } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { RegisterRequest } from '../_models/user';
import { AlertifyService } from '../_services/alertify.service';
import { AuthService } from '../_services/auth.service';

export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  return group.get('password')?.value === group.get('confirmPassword')?.value ? null : { mismatch: true };
}

/** Latest birth date allowed: members must be 18+. */
function maxBirthDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly alertify = inject(AlertifyService);
  private readonly router = inject(Router);

  readonly cancelRegister = output<void>();
  readonly maxDate = maxBirthDate();

  readonly registerForm = inject(FormBuilder).nonNullable.group(
    {
      gender: ['male'],
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  invalid(name: string): boolean {
    const control = this.registerForm.get(name);
    return !!control && control.invalid && control.touched;
  }

  register(): void {
    if (this.registerForm.invalid) return;
    const { confirmPassword: _, ...user } = this.registerForm.getRawValue();
    const request: RegisterRequest = user;
    this.authService
      .register(request)
      .pipe(switchMap(() => this.authService.login({ username: request.username, password: request.password })))
      .subscribe({
        next: () => {
          this.alertify.success('Registration successful');
          this.router.navigate(['/members']);
        },
        error: (error: string) => this.alertify.error(error),
      });
  }
}
