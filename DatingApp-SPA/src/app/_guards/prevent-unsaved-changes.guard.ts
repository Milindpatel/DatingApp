import { CanDeactivateFn } from '@angular/router';
import { MemberEditComponent } from '../members/member-edit/member-edit.component';

export const preventUnsavedChanges: CanDeactivateFn<MemberEditComponent> = (component) =>
  !component.hasUnsavedChanges() || confirm('Are you sure you want to continue? Any unsaved changes will be lost');
