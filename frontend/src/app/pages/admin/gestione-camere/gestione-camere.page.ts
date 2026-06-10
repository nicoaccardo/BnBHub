import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
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
  IonTextarea
} from '@ionic/angular/standalone';
import { Camera, CameraPayload, RoomService } from '../../../services/room.service';

function imageUrlValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value || '').trim();

  if (!value) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return { invalidImageUrl: true };
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return { invalidImageUrl: true };
  }

  const hostname = url.hostname.toLowerCase();

  if (hostname === 'unsplash.com' || hostname === 'www.unsplash.com') {
    return { unsplashPageUrl: true };
  }

  return null;
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
    IonTextarea
  ]
})
export class GestioneCamerePage implements OnInit {
  camere: Camera[] = [];
  cameraForm!: FormGroup;
  cameraInModifica: Camera | null = null;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  private imageLoadErrors = new WeakMap<FormControl<string | null>, string>();

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService
  ) {}

  ngOnInit() {
    this.cameraForm = this.fb.group({
      nome: ['', Validators.required],
      tipo: ['', Validators.required],
      descrizione: [''],
      prezzo: [0, [Validators.required, Validators.min(1)]],
      capienza: [1, [Validators.required, Validators.min(1)]],
      disponibile: [1, Validators.required],
      immagini_url: this.createImageArray([''])
    });

    this.caricaCamere();
  }

  get immaginiUrl(): FormArray<FormControl<string | null>> {
    return this.cameraForm.get('immagini_url') as FormArray<FormControl<string | null>>;
  }

  caricaCamere(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.roomService.getAll().subscribe({
      next: (camere) => {
        this.camere = camere;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Errore durante il caricamento delle camere.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  salvaCamera(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.cameraForm.invalid) {
      this.cameraForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const camera = this.buildCameraPayload();
    const richiesta = this.cameraInModifica
      ? this.roomService.update(this.cameraInModifica.id, camera)
      : this.roomService.create(camera);

    richiesta.subscribe({
      next: () => {
        this.successMessage = this.cameraInModifica
          ? 'Camera aggiornata con successo.'
          : 'Camera creata con successo.';
        this.annullaModifica();
        this.caricaCamere();
        this.isSaving = false;
      },
      error: (err) => {
        this.errorMessage = this.getErrorMessage(err, 'Errore durante il salvataggio della camera.');
        this.isSaving = false;
        console.error(err);
      }
    });
  }

  modificaCamera(camera: Camera): void {
    this.cameraInModifica = camera;
    this.successMessage = '';
    this.errorMessage = '';
    this.cameraForm.patchValue({
      nome: camera.nome,
      tipo: camera.tipo,
      descrizione: camera.descrizione,
      prezzo: camera.prezzo,
      capienza: camera.capienza,
      disponibile: camera.disponibile
    });
    this.setImmagini(camera.immagini_url?.length ? camera.immagini_url : [camera.immagine_url || '']);
  }

  annullaModifica(): void {
    this.cameraInModifica = null;
    this.cameraForm.reset({
      nome: '',
      tipo: '',
      descrizione: '',
      prezzo: 0,
      capienza: 1,
      disponibile: 1
    });
    this.setImmagini(['']);
  }

  aggiungiImmagine(): void {
    this.immaginiUrl.push(this.createImageControl(''));
  }

  rimuoviImmagine(index: number): void {
    if (this.immaginiUrl.length === 1) {
      this.immaginiUrl.at(0).setValue('');
      return;
    }

    this.immaginiUrl.removeAt(index);
  }

  anteprimaImmagine(control: FormControl<string | null>): string | null {
    const url = this.getImageControlUrl(control);
    return url && control.valid ? url : null;
  }

  erroreUrlImmagine(control: FormControl<string | null>): string {
    if (control.hasError('unsplashPageUrl')) {
      return 'Il link Unsplash deve essere diretto. Usa "Copia indirizzo immagine".';
    }

    return 'Inserisci un URL immagine valido che inizi con http:// o https://.';
  }

  immagineNonCaricabile(control: FormControl<string | null>): boolean {
    const url = this.getImageControlUrl(control);
    return !!url && this.imageLoadErrors.get(control) === url;
  }

  segnalaImmagineCaricata(control: FormControl<string | null>): void {
    this.imageLoadErrors.delete(control);
  }

  segnalaImmagineNonCaricabile(control: FormControl<string | null>): void {
    const url = this.getImageControlUrl(control);

    if (url) {
      this.imageLoadErrors.set(control, url);
    }
  }

  contaImmagini(camera: Camera): number {
    return this.getImmaginiCamera(camera).length;
  }

  immaginePrincipale(camera: Camera): string | null {
    const immagini = this.getImmaginiCamera(camera);
    return immagini[0] || null;
  }

  eliminaCamera(camera: Camera): void {
    const conferma = window.confirm(`Vuoi eliminare la camera "${camera.nome}"?`);

    if (!conferma) {
      return;
    }

    this.roomService.delete(camera.id).subscribe({
      next: () => {
        this.successMessage = 'Camera eliminata con successo.';
        this.caricaCamere();
      },
      error: (err) => {
        this.errorMessage = 'Errore durante l\'eliminazione della camera.';
        console.error(err);
      }
    });
  }

  private setImmagini(urls: Array<string | null | undefined>): void {
    const immagini = urls.map((url) => String(url || '').trim());
    this.cameraForm.setControl('immagini_url', this.createImageArray(immagini.length ? immagini : ['']));
    this.imageLoadErrors = new WeakMap<FormControl<string | null>, string>();
  }

  private getImmaginiCamera(camera: Camera): string[] {
    if (camera.immagini_url?.length) {
      return camera.immagini_url;
    }

    return camera.immagine_url ? [camera.immagine_url] : [];
  }

  private buildCameraPayload(): CameraPayload {
    return {
      nome: String(this.cameraForm.get('nome')?.value || '').trim(),
      tipo: String(this.cameraForm.get('tipo')?.value || '').trim(),
      descrizione: String(this.cameraForm.get('descrizione')?.value || '').trim(),
      prezzo: Number(this.cameraForm.get('prezzo')?.value),
      capienza: Number(this.cameraForm.get('capienza')?.value),
      disponibile: Number(this.cameraForm.get('disponibile')?.value),
      immagini_url: this.immaginiUrl.controls
        .map((control) => String(control.value || '').trim())
        .filter((url) => url !== '')
    };
  }

  private createImageArray(urls: string[]): FormArray<FormControl<string | null>> {
    return this.fb.array(urls.map((url) => this.createImageControl(url)));
  }

  private createImageControl(url: string): FormControl<string | null> {
    return this.fb.control(url, imageUrlValidator);
  }

  private getImageControlUrl(control: FormControl<string | null>): string {
    return String(control.value || '').trim();
  }

  private getErrorMessage(err: HttpErrorResponse, fallback: string): string {
    return typeof err.error?.errore === 'string' ? err.error.errore : fallback;
  }
}
