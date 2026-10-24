import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '../../_models/user';
import { DEFAULT_PHOTO } from '../../_services/auth.service';

@Component({
  selector: 'app-member-card',
  imports: [RouterLink],
  templateUrl: './member-card.component.html',
  styleUrl: './member-card.component.css',
})
export class MemberCardComponent {
  readonly user = input.required<User>();
  protected readonly defaultPhoto = DEFAULT_PHOTO;
}
