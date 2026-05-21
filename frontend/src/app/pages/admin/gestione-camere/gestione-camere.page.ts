import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonItem,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { RoomService } from '../../../services/room.service';

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
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonInput,
    IonItem,
    IonRow,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonText,
    IonTextarea,
    IonTitle,
    IonToolbar
  ]
})
export class GestioneCamerePage implements OnInit {
  camere: any[] = [];
  cameraForm!: FormGroup;
  cameraInModifica: any | null = null;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

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
      immagine_url: ['']
    });

    this.caricaCamere();
  }

  caricaCamere() {
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

  salvaCamera() {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.cameraForm.invalid) {
      this.cameraForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const camera = this.cameraForm.value;
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
        this.errorMessage = 'Errore durante il salvataggio della camera.';
        this.isSaving = false;
        console.error(err);
      }
    });
  }

  modificaCamera(camera: any) {
    this.cameraInModifica = camera;
    this.successMessage = '';
    this.errorMessage = '';
    this.cameraForm.patchValue({
      nome: camera.nome,
      tipo: camera.tipo,
      descrizione: camera.descrizione,
      prezzo: camera.prezzo,
      capienza: camera.capienza,
      disponibile: camera.disponibile,
      immagine_url: camera.immagine_url
    });
  }

  annullaModifica() {
    this.cameraInModifica = null;
    this.cameraForm.reset({
      nome: '',
      tipo: '',
      descrizione: '',
      prezzo: 0,
      capienza: 1,
      disponibile: 1,
      immagine_url: ''
    });
  }

  eliminaCamera(camera: any) {
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
}
