import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonButton, IonContent, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { RoomService } from '../../../services/room.service';
import { BookingService } from '../../../services/booking.service';

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

  constructor(
    private roomService: RoomService,
    private bookingService: BookingService
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
  }

}
