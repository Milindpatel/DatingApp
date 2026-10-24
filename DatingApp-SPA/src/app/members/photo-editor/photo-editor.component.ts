import { DecimalPipe } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { Photo } from '../../_models/photo';
import { AlertifyService } from '../../_services/alertify.service';
import { AuthService } from '../../_services/auth.service';
import { UserService } from '../../_services/user.service';

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

@Component({
  selector: 'app-photo-editor',
  imports: [DecimalPipe],
  templateUrl: './photo-editor.component.html',
  styleUrl: './photo-editor.component.css',
})
export class PhotoEditorComponent {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly alertify = inject(AlertifyService);

  readonly photos = input<Photo[]>([]);
  /** Local list so uploads and deletes show up immediately. */
  readonly list = linkedSignal(() => [...this.photos()]);

  readonly queue = signal<File[]>([]);
  readonly uploading = signal(false);
  readonly progress = signal(0);
  readonly dropZoneOver = signal(false);
  readonly queueSize = computed(() => this.queue().reduce((total, f) => total + f.size, 0));

  addFiles(files: FileList | null | undefined): void {
    const accepted: File[] = [];
    for (const file of Array.from(files ?? [])) {
      if (!file.type.startsWith('image/')) {
        this.alertify.warning(`${file.name} is not an image`);
      } else if (file.size > MAX_FILE_SIZE) {
        this.alertify.warning(`${file.name} is larger than 10 MB`);
      } else {
        accepted.push(file);
      }
    }
    this.queue.update((q) => [...q, ...accepted]);
  }

  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addFiles(input.files);
    input.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dropZoneOver.set(false);
    this.addFiles(event.dataTransfer?.files);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dropZoneOver.set(true);
  }

  removeFromQueue(index: number): void {
    this.queue.update((q) => q.filter((_, i) => i !== index));
  }

  clearQueue(): void {
    this.queue.set([]);
  }

  /** Uploads queued files one at a time. */
  uploadAll(): void {
    const [file] = this.queue();
    if (!file) {
      this.uploading.set(false);
      return;
    }
    this.uploading.set(true);
    this.progress.set(0);
    this.userService.uploadPhoto(this.authService.userId, file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress.set(Math.round((100 * event.loaded) / event.total));
        } else if (event.type === HttpEventType.Response && event.body) {
          this.onUploaded(event.body);
        }
      },
      error: (error: string) => {
        this.alertify.error(`${file.name}: ${error}`);
        this.uploading.set(false);
      },
      complete: () => {
        this.queue.update((q) => q.slice(1));
        this.uploadAll();
      },
    });
  }

  setMainPhoto(photo: Photo): void {
    this.userService.setMainPhoto(this.authService.userId, photo.id).subscribe({
      next: () => {
        this.list.update((list) => list.map((p) => ({ ...p, isMain: p.id === photo.id })));
        this.authService.changeMemberPhoto(photo.url);
      },
      error: (error: string) => this.alertify.error(error),
    });
  }

  deletePhoto(id: number): void {
    this.alertify.confirm('Are you sure you want to delete this photo?', () => {
      this.userService.deletePhoto(this.authService.userId, id).subscribe({
        next: () => {
          this.list.update((list) => list.filter((p) => p.id !== id));
          this.alertify.success('Photo has been deleted');
        },
        error: () => this.alertify.error('Failed to delete the photo'),
      });
    });
  }

  private onUploaded(photo: Photo): void {
    this.list.update((list) => [...list, photo]);
    if (photo.isMain) this.authService.changeMemberPhoto(photo.url);
  }
}
