import { TitleCasePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AlertifyService } from '../_services/alertify.service';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-nav',
  imports: [FormsModule, RouterLink, RouterLinkActive, TitleCasePipe],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
  host: { '(document:click)': 'menuOpen.set(false)' },
})
export class NavComponent {
  protected readonly authService = inject(AuthService);
  private readonly alertify = inject(AlertifyService);
  private readonly router = inject(Router);

  model = { username: '', password: '' };
  readonly menuOpen = signal(false);
  readonly navOpen = signal(false);

  login(): void {
    this.authService.login(this.model).subscribe({
      next: () => {
        this.alertify.success('Logged in successfully');
        this.model = { username: '', password: '' };
        this.router.navigate(['/members']);
      },
      error: (error: string) => this.alertify.error(error),
    });
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen.update((open) => !open);
  }

  logout(): void {
    this.authService.logout();
    this.menuOpen.set(false);
    this.alertify.message('Logged out');
    this.router.navigate(['/']);
  }
}
