import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AlertifyService } from '../../_services/alertify.service';
import { MAX_FILE_SIZE, PhotoEditorComponent } from './photo-editor.component';

describe('PhotoEditorComponent', () => {
  const warnings: string[] = [];

  beforeEach(() => {
    warnings.length = 0;
    TestBed.configureTestingModule({
      imports: [PhotoEditorComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AlertifyService, useValue: { warning: (m: string) => warnings.push(m) } },
      ],
    });
  });

  function filesOf(...files: File[]): FileList {
    return Object.assign(files, { item: (i: number) => files[i] }) as unknown as FileList;
  }

  it('queues images and rejects other files and oversized images', () => {
    const component = TestBed.createComponent(PhotoEditorComponent).componentInstance;
    const ok = new File(['x'], 'ok.png', { type: 'image/png' });
    const text = new File(['x'], 'notes.txt', { type: 'text/plain' });
    const huge = new File([new Uint8Array(MAX_FILE_SIZE + 1)], 'huge.jpg', { type: 'image/jpeg' });

    component.addFiles(filesOf(ok, text, huge));

    expect(component.queue().map((f) => f.name)).toEqual(['ok.png']);
    expect(warnings).toEqual(['notes.txt is not an image', 'huge.jpg is larger than 10 MB']);
  });

  it('removes items from the queue', () => {
    const component = TestBed.createComponent(PhotoEditorComponent).componentInstance;
    component.addFiles(filesOf(new File(['a'], 'a.png', { type: 'image/png' }), new File(['b'], 'b.png', { type: 'image/png' })));
    component.removeFromQueue(0);
    expect(component.queue().map((f) => f.name)).toEqual(['b.png']);
  });
});
