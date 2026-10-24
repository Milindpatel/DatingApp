import { DatePipe } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { User } from '../../_models/user';
import { DEFAULT_PHOTO } from '../../_services/auth.service';
import { PhotoGalleryComponent } from '../photo-gallery/photo-gallery.component';

type Tab = 'about' | 'interests' | 'photos' | 'messages';

@Component({
  selector: 'app-member-detail',
  imports: [DatePipe, PhotoGalleryComponent],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.css',
})
export class MemberDetailComponent {
  /** Bound from the route resolver. */
  readonly user = input.required<User>();
  readonly tab = signal<Tab>('about');
  protected readonly defaultPhoto = DEFAULT_PHOTO;
}
