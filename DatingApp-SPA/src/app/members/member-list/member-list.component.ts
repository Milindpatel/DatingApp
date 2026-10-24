import { Component, input } from '@angular/core';
import { User } from '../../_models/user';
import { MemberCardComponent } from '../member-card/member-card.component';

@Component({
  selector: 'app-member-list',
  imports: [MemberCardComponent],
  template: `
    <div class="container mt-5">
      <div class="row">
        @for (user of users(); track user.id) {
          <div class="col-lg-2 col-md-3 col-sm-6">
            <app-member-card [user]="user" />
          </div>
        } @empty {
          <p class="text-muted">No matches yet.</p>
        }
      </div>
    </div>
  `,
})
export class MemberListComponent {
  /** Bound from the route resolver. */
  readonly users = input<User[]>([]);
}
