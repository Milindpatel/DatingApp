import { DatePipe } from '@angular/common';
import { Component, inject, input, linkedSignal, signal, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { User } from '../../_models/user';
import { AlertifyService } from '../../_services/alertify.service';
import { AuthService } from '../../_services/auth.service';
import { UserService } from '../../_services/user.service';
import { PhotoEditorComponent } from '../photo-editor/photo-editor.component';

@Component({
  selector: 'app-member-edit',
  imports: [DatePipe, FormsModule, PhotoEditorComponent],
  templateUrl: './member-edit.component.html',
  styleUrl: './member-edit.component.css',
  host: { '(window:beforeunload)': 'onBeforeUnload($event)' },
})
export class MemberEditComponent {
  private readonly alertify = inject(AlertifyService);
  private readonly userService = inject(UserService);
  protected readonly authService = inject(AuthService);

  /** Bound from the route resolver. */
  readonly user = input.required<User>();
  /** Editable copy of the resolved user. */
  readonly model = linkedSignal(() => ({ ...this.user() }));
  readonly tab = signal<'profile' | 'photos'>('profile');
  readonly editForm = viewChild<NgForm>('editForm');

  hasUnsavedChanges(): boolean {
    return !!this.editForm()?.dirty;
  }

  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) event.preventDefault();
  }

  updateUser(): void {
    this.userService.updateUser(this.authService.userId, this.model()).subscribe({
      next: () => {
        this.alertify.success('Profile updated successfully');
        this.editForm()?.resetForm(this.model());
      },
      error: (error: string) => this.alertify.error(error),
    });
  }
}
