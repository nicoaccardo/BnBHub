import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonRow,
  IonSpinner
} from '@ionic/angular/standalone';
import * as L from 'leaflet';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCol,
    IonContent,
    IonGrid,
    IonRow,
    IonSpinner
  ]
})
export class HomePage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;

  private map: L.Map | undefined;
  camere: any[] = [];
  isLoadingRooms = false;
  roomsError = '';

  structurePhotos = [
    {
      src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
      alt: 'Facciata elegante di una struttura ricettiva'
    },
    {
      src: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80',
      alt: 'Area lounge luminosa della struttura'
    },
    {
      src: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
      alt: 'Sala colazione accogliente'
    },
    {
      src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80',
      alt: 'Terrazza esterna della struttura'
    }
  ];

  fallbackRooms = [
    {
      nome: 'Camera Comfort',
      tipo: 'doppia',
      descrizione: 'Una camera luminosa con arredi essenziali e atmosfera rilassata.',
      prezzo: 89,
      capienza: 2,
      immagine_url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80'
    },
    {
      nome: 'Suite Vista Citta',
      tipo: 'suite',
      descrizione: 'Spazi ampi, dettagli curati e una vista ideale per soggiorni speciali.',
      prezzo: 139,
      capienza: 3,
      immagine_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80'
    },
    {
      nome: 'Camera Family',
      tipo: 'familiare',
      descrizione: 'Soluzione comoda per famiglie o piccoli gruppi in visita a Palermo.',
      prezzo: 119,
      capienza: 4,
      immagine_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80'
    }
  ];

  services = [
    { title: 'Colazione locale', text: 'Prodotti freschi e sapori del territorio ogni mattina.' },
    { title: 'WiFi veloce', text: 'Connessione stabile in camere e aree comuni.' },
    { title: 'Comfort in camera', text: 'Aria condizionata, bagno privato e spazi curati.' },
    { title: 'Posizione comoda', text: 'Perfetta per muoversi tra universita, centro e servizi.' }
  ];

  reviews = [
    {
      name: 'Mario Rossi',
      text: 'Soggiorno perfetto, camera pulita e posizione comodissima. Staff sempre disponibile.'
    },
    {
      name: 'Giulia Bianchi',
      text: 'Colazione abbondante e ambiente tranquillo. Ottimo rapporto qualita-prezzo.'
    },
    {
      name: 'Luca Ferrara',
      text: 'Struttura accogliente, ben collegata e ideale per un weekend a Palermo.'
    },
    {
      name: 'Elena Greco',
      text: 'Check-in semplice, camera luminosa e tanti dettagli pensati per far stare bene.'
    }
  ];

  constructor(private roomService: RoomService) {}

  ngOnInit() {
    window.dispatchEvent(new CustomEvent('bnbhub-home-scroll', { detail: 0 }));
    this.caricaCamere();

    setTimeout(() => {
      this.initMap();
    }, 500);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  onHomeScroll(event: CustomEvent) {
    const scrollTop = event.detail?.scrollTop || 0;
    window.dispatchEvent(new CustomEvent('bnbhub-home-scroll', { detail: scrollTop }));
  }

  @HostListener('window:bnbhub-scroll-section', ['$event'])
  scrollToSection(event: CustomEvent<string>) {
    this.scrollToSectionById(event.detail);
  }

  @HostListener('window:bnbhub-scroll-top')
  scrollToTop() {
    if (!this.content) {
      return;
    }

    this.content.scrollToTop(500);
  }

  scrollToSectionById(sectionId: string) {
    const target = document.getElementById(sectionId);

    if (!target || !this.content) {
      return;
    }

    this.content.getScrollElement().then((scrollElement) => {
      const targetTop = target.getBoundingClientRect().top + scrollElement.scrollTop - 78;
      this.content.scrollToPoint(0, targetTop, 500);
    });
  }

  get camereDaMostrare(): any[] {
    return this.camere.length > 0 ? this.camere : this.fallbackRooms;
  }

  private caricaCamere(): void {
    this.isLoadingRooms = true;
    this.roomsError = '';

    this.roomService.getAll().subscribe({
      next: (camere) => {
        this.camere = camere;
        this.isLoadingRooms = false;
      },
      error: (err) => {
        this.roomsError = 'Le camere reali non sono momentaneamente disponibili: stai vedendo una selezione dimostrativa.';
        this.isLoadingRooms = false;
        console.error(err);
      }
    });
  }

  private initMap(): void {
    if (this.map) {
      return;
    }

    this.map = L.map('map').setView([38.1157, 13.3615], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    L.marker([38.104721, 13.348338]).addTo(this.map)
      .bindPopup('<b>BnBHub</b><br>Ti aspettiamo ad Unipa!')
      .openPopup();
  }
}
