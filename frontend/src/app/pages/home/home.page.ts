import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cafeOutline, locationOutline, snowOutline, wifiOutline } from 'ionicons/icons';
import * as L from 'leaflet';
import { RecensionePubblica, ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonIcon,
    IonSpinner
  ]
})
export class HomePage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;

  private map: L.Map | undefined;
  private galleryAutoplayTimer: ReturnType<typeof setInterval> | undefined;
  private readonly galleryAutoplayDelay = 3000;
  recensioni: RecensionePubblica[] = [];
  isLoadingReviews = false;
  reviewsError = '';
  readonly stelleRecensione = [1, 2, 3, 4, 5];
  activeGalleryIndex = 0;

  readonly galleryPhotos = [
    {
      src: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80',
      alt: 'Camera matrimoniale luminosa con letto preparato'
    },
    {
      src: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80',
      alt: 'Suite con arredi chiari e vista sulla città'
    },
    {
      src: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80',
      alt: 'Camera familiare ampia e ordinata'
    },
    {
      src: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
      alt: 'Sala colazione accogliente con tavoli apparecchiati'
    },
    {
      src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80',
      alt: 'Terrazza esterna della struttura'
    }
  ];

  readonly services = [
    { icon: 'cafe-outline', title: 'Colazione locale', text: 'Prodotti freschi e sapori del territorio ogni mattina.' },
    { icon: 'wifi-outline', title: 'WiFi veloce', text: 'Connessione stabile in camere e aree comuni.' },
    { icon: 'snow-outline', title: 'Comfort in camera', text: 'Aria condizionata, bagno privato e spazi curati.' },
    { icon: 'location-outline', title: 'Posizione comoda', text: 'Perfetta per muoversi tra l’università, il centro e i servizi.' }
  ];

  private readonly fallbackReviews: RecensionePubblica[] = [
    {
      id: -1,
      nome_ospite: 'Martina R.',
      camera_nome: 'Camera Comfort',
      voto: 5,
      testo: 'Camera pulita, staff gentile e posizione davvero comoda per girare Palermo.',
      created_at: ''
    },
    {
      id: -2,
      nome_ospite: 'Luca P.',
      camera_nome: 'Suite Vista Città',
      voto: 5,
      testo: 'Soggiorno tranquillo, colazione curata e ottimi consigli per visitare la città.',
      created_at: ''
    },
    {
      id: -3,
      nome_ospite: 'Sara M.',
      camera_nome: 'Camera Family',
      voto: 4,
      testo: 'Spazi ordinati e pratici, perfetti per un weekend senza pensieri.',
      created_at: ''
    }
  ];

  constructor(private reviewService: ReviewService) {
    addIcons({ cafeOutline, locationOutline, snowOutline, wifiOutline });
  }

  ngOnInit(): void {
    window.dispatchEvent(new CustomEvent('bnbhub-home-scroll', { detail: 0 }));
    this.caricaRecensioni();
    this.startGalleryAutoplay();

    setTimeout(() => {
      this.initMap();
    }, 500);
  }

  ngOnDestroy(): void {
    this.stopGalleryAutoplay();

    if (this.map) {
      this.map.remove();
    }
  }

  ionViewWillEnter(): void {
    this.startGalleryAutoplay();
  }

  ionViewDidLeave(): void {
    this.stopGalleryAutoplay();
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

  selectGalleryPhoto(index: number): void {
    this.activeGalleryIndex = index;
    this.stopGalleryAutoplay();
    this.startGalleryAutoplay();
  }

  get recensioniDaMostrare(): RecensionePubblica[] {
    if (this.recensioni.length > 0) {
      return this.recensioni;
    }

    return this.reviewsError ? this.fallbackReviews : [];
  }

  private caricaRecensioni(): void {
    this.isLoadingReviews = true;
    this.reviewsError = '';

    this.reviewService.getPublic().subscribe({
      next: (recensioni) => {
        this.recensioni = recensioni;
        this.isLoadingReviews = false;
      },
      error: (err) => {
        this.reviewsError = 'Le recensioni reali non sono momentaneamente disponibili: stai vedendo una selezione dimostrativa.';
        this.isLoadingReviews = false;
        console.error(err);
      }
    });
  }

  private showNextGalleryPhoto(): void {
    this.activeGalleryIndex = (this.activeGalleryIndex + 1) % this.galleryPhotos.length;
  }

  private startGalleryAutoplay(): void {
    if (
      this.galleryAutoplayTimer ||
      this.galleryPhotos.length < 2
    ) {
      return;
    }

    this.galleryAutoplayTimer = setInterval(() => {
      this.showNextGalleryPhoto();
    }, this.galleryAutoplayDelay);
  }

  private stopGalleryAutoplay(): void {
    if (!this.galleryAutoplayTimer) {
      return;
    }

    clearInterval(this.galleryAutoplayTimer);
    this.galleryAutoplayTimer = undefined;
  }

  private initMap(): void {
    if (this.map) {
      return;
    }

    this.map = L.map('map').setView([38.1157, 13.3615], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    const markerIcon = L.divIcon({
      className: 'bnb-map-marker',
      html: '<span aria-hidden="true"></span>',
      iconSize: [32, 40],
      iconAnchor: [16, 38],
      popupAnchor: [0, -34]
    });

    L.marker([38.104721, 13.348338], { icon: markerIcon }).addTo(this.map)
      .bindPopup('<b>BnBHub</b><br>Ti aspettiamo ad Unipa!')
      .openPopup();
  }
}
