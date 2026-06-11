import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTextarea,
  IonToast
} from '@ionic/angular/standalone';
import {
  Camera,
  CameraImage,
  CameraPayload,
  RoomService
} from '../../../services/room.service';

type PreviewSource = 'existing' | 'new';

interface ImagePreview {
  key: string;
  source: PreviewSource;
  url: string;
  name: string;
  size?: number;
  imageId?: number;
  file?: File;
}

@Component({
  selector: 'app-gestione-camere',
  templateUrl: './gestione-camere.page.html',
  styleUrls: ['./gestione-camere.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonInput,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonText,
    IonTextarea,
    IonToast
  ]
})
export class GestioneCamerePage implements OnInit, OnDestroy {
  readonly maxImages = 10;
  readonly maxImageSize = 5 * 1024 * 1024;
  readonly acceptedImageTypes = 'image/jpeg,image/png,image/webp';

  camere: Camera[] = [];
  cameraForm!: FormGroup;
  cameraInModifica: Camera | null = null;
  imagePreviews: ImagePreview[] = [];
  isLoading = false;
  isSaving = false;
  imagesTouched = false;
  errorMessage = '';
  imageErrorMessage = '';
  toastMessage = '';
  toastColor: 'success' | 'danger' = 'success';
  isToastOpen = false;
  private nextPreviewId = 0;

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.cameraForm = this.fb.group({
      nome: ['', Validators.required],
      tipo: ['', Validators.required],
      descrizione: [''],
      prezzo: [0, [Validators.required, Validators.min(1)]],
      capienza: [1, [Validators.required, Validators.min(1)]],
      disponibile: [1, Validators.required]
    });

    this.caricaCamere();
  }

  ngOnDestroy(): void {
    this.revokeNewPreviewUrls();
  }

  caricaCamere(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.roomService.getAll().subscribe({
      next: (camere) => {
        this.camere = camere;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          err,
          'Errore durante il caricamento delle camere.'
        );
        this.isLoading = false;
        this.presentToast(this.errorMessage, 'danger');
        console.error(err);
      }
    });
  }

  salvaCamera(): void {
    this.errorMessage = '';
    this.imagesTouched = true;

    if (this.cameraForm.invalid || this.imagePreviews.length === 0) {
      this.cameraForm.markAllAsTouched();
      return;
    }

    const payload = this.buildCameraPayload();
    const newFiles = this.imagePreviews
      .filter((preview) => preview.source === 'new' && preview.file)
      .map((preview) => preview.file as File);
    const keptImageIds = this.imagePreviews
      .filter((preview) => preview.source === 'existing' && preview.imageId)
      .map((preview) => preview.imageId as number);
    const richiesta = this.cameraInModifica
      ? this.roomService.update(this.cameraInModifica.id, payload, keptImageIds, newFiles)
      : this.roomService.create(payload, newFiles);

    this.isSaving = true;

    richiesta.subscribe({
      next: () => {
        const message = this.cameraInModifica
          ? 'Camera aggiornata con successo.'
          : 'Camera creata con successo.';

        this.isSaving = false;
        this.resetForm();
        this.caricaCamere();
        this.presentToast(message, 'success');
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          err,
          'Errore durante il salvataggio della camera.'
        );
        this.isSaving = false;
        this.presentToast(this.errorMessage, 'danger');
        console.error(err);
      }
    });
  }

  modificaCamera(camera: Camera): void {
    this.revokeNewPreviewUrls();
    this.cameraInModifica = camera;
    this.errorMessage = '';
    this.imageErrorMessage = '';
    this.imagesTouched = false;
    this.cameraForm.reset({
      nome: camera.nome,
      tipo: camera.tipo,
      descrizione: camera.descrizione || '',
      prezzo: camera.prezzo,
      capienza: camera.capienza,
      disponibile: camera.disponibile
    });
    this.imagePreviews = (camera.immagini || []).map((image, index) =>
      this.createExistingPreview(image, index)
    );
  }

  annullaModifica(): void {
    this.resetForm();
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    this.addFiles(files);
    input.value = '';
  }

  addFiles(files: File[]): void {
    this.imagesTouched = true;
    this.imageErrorMessage = '';

    for (const file of files) {
      if (this.imagePreviews.length >= this.maxImages) {
        this.imageErrorMessage = `Puoi caricare al massimo ${this.maxImages} immagini per camera.`;
        break;
      }

      if (!this.isAcceptedImageType(file.type)) {
        this.imageErrorMessage = `Il file "${file.name}" non è JPEG, PNG o WebP.`;
        continue;
      }

      if (file.size > this.maxImageSize) {
        this.imageErrorMessage = `Il file "${file.name}" supera il limite di 5 MB.`;
        continue;
      }

      this.imagePreviews.push({
        key: `new-${this.nextPreviewId++}`,
        source: 'new',
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        file
      });
    }
  }

  removeImage(index: number): void {
    const preview = this.imagePreviews[index];

    if (!preview) {
      return;
    }

    if (preview.source === 'new') {
      URL.revokeObjectURL(preview.url);
    }

    this.imagePreviews.splice(index, 1);
    this.imagesTouched = true;
    this.imageErrorMessage = '';
  }

  formatFileSize(size?: number): string {
    if (size === undefined) {
      return 'Foto già salvata';
    }

    if (size < 1024 * 1024) {
      return `${Math.max(Math.round(size / 1024), 1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  contaImmagini(camera: Camera): number {
    return camera.immagini?.length || camera.immagini_url?.length || 0;
  }

  immaginePrincipale(camera: Camera): string | null {
    return camera.immagini?.[0]?.url || camera.immagini_url?.[0] || camera.immagine_url || null;
  }

  eliminaCamera(camera: Camera): void {
    const conferma = window.confirm(`Vuoi eliminare la camera "${camera.nome}"?`);

    if (!conferma) {
      return;
    }

    this.roomService.delete(camera.id).subscribe({
      next: () => {
        this.caricaCamere();
        this.presentToast('Camera eliminata con successo.', 'success');
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          err,
          'Errore durante l’eliminazione della camera.'
        );
        this.presentToast(this.errorMessage, 'danger');
        console.error(err);
      }
    });
  }

  closeToast(): void {
    this.isToastOpen = false;
  }

  private resetForm(): void {
    this.revokeNewPreviewUrls();
    this.cameraInModifica = null;
    this.imagePreviews = [];
    this.imagesTouched = false;
    this.imageErrorMessage = '';
    this.errorMessage = '';
    this.cameraForm.reset({
      nome: '',
      tipo: '',
      descrizione: '',
      prezzo: 0,
      capienza: 1,
      disponibile: 1
    });
  }

  private createExistingPreview(image: CameraImage, index: number): ImagePreview {
    return {
      key: `existing-${image.id}`,
      source: 'existing',
      url: image.url,
      name: `Foto salvata ${index + 1}`,
      imageId: image.id
    };
  }

  private buildCameraPayload(): CameraPayload {
    return {
      nome: String(this.cameraForm.get('nome')?.value || '').trim(),
      tipo: String(this.cameraForm.get('tipo')?.value || '').trim(),
      descrizione: String(this.cameraForm.get('descrizione')?.value || '').trim(),
      prezzo: Number(this.cameraForm.get('prezzo')?.value),
      capienza: Number(this.cameraForm.get('capienza')?.value),
      disponibile: Number(this.cameraForm.get('disponibile')?.value)
    };
  }

  private isAcceptedImageType(type: string): boolean {
    return ['image/jpeg', 'image/png', 'image/webp'].includes(type);
  }

  private revokeNewPreviewUrls(): void {
    for (const preview of this.imagePreviews) {
      if (preview.source === 'new') {
        URL.revokeObjectURL(preview.url);
      }
    }
  }

  private presentToast(message: string, color: 'success' | 'danger'): void {
    this.toastMessage = message;
    this.toastColor = color;
    this.isToastOpen = true;
  }

  private getErrorMessage(err: HttpErrorResponse, fallback: string): string {
    return typeof err.error?.errore === 'string' ? err.error.errore : fallback;
  }
}
