import { Component, computed, input, signal } from '@angular/core';
import { Photo } from '../../_models/photo';

/** Simple image gallery: one large photo plus clickable thumbnails. */
@Component({
  selector: 'app-photo-gallery',
  template: `
    @if (current(); as photo) {
      <figure class="mb-2">
        <img class="img-fluid rounded main" [src]="photo.url" [alt]="photo.description || 'Photo'" />
        @if (photo.description) {
          <figcaption class="text-muted small mt-1">{{ photo.description }}</figcaption>
        }
      </figure>
      <div class="d-flex flex-wrap gap-2">
        @for (p of photos(); track p.id; let i = $index) {
          <button type="button" class="thumb p-0 border-0" [class.active]="i === index()"
            [attr.aria-label]="'Show photo ' + (i + 1)" [attr.aria-pressed]="i === index()" (click)="index.set(i)">
            <img [src]="p.url" alt="" />
          </button>
        }
      </div>
    } @else {
      <p class="text-muted">No photos yet.</p>
    }
  `,
  styles: `
    .main { max-height: 500px; object-fit: cover; width: 100%; }
    .thumb img { width: 80px; height: 80px; object-fit: cover; border-radius: 4px; opacity: 0.6; }
    .thumb.active img, .thumb:hover img { opacity: 1; outline: 3px solid var(--bs-primary); }
  `,
})
export class PhotoGalleryComponent {
  readonly photos = input<Photo[]>([]);
  readonly index = signal(0);
  readonly current = computed(() => this.photos()[this.index()] ?? this.photos()[0] ?? null);
}
