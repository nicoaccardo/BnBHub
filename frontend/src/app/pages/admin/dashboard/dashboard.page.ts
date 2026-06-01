import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonButton, IonContent, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { RoomService } from '../../../services/room.service';
import { BookingService } from '../../../services/booking.service';
import { ReviewService } from '../../../services/review.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [RouterModule, IonButton, IonContent, IonCard, IonCardContent]
})
export class DashboardPage implements OnInit {

  totalePrenotazioni: number = 0;
  totaleCamere: number = 0;
  prenotazioniInAttesa: number = 0;
  recensioniDaModerare: number = 0;

  constructor(
    private roomService: RoomService,
    private bookingService: BookingService,
    private reviewService: ReviewService
  ) {}

  ngOnInit() {
    this.roomService.getAll().subscribe({
      next: (rooms) => this.totaleCamere = rooms.length,
      error: (err) => console.error(err)
    });

    this.bookingService.getAll().subscribe({
      next: (bookings) => {
        this.totalePrenotazioni = bookings.length;
        this.prenotazioniInAttesa = bookings.filter((b: any) => b.stato === 'in attesa').length;
      },
      error: (err) => console.error(err)
    });

    this.reviewService.getAll().subscribe({
      next: (reviews) => {
        this.recensioniDaModerare = reviews.filter((review) => review.stato === 'in attesa').length;
      },
      error: (err) => console.error(err)
    });
  }

}
