import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message/message.service';
import { ReservationService } from '../../services/reservation/reservation.service';

@Component({
  selector: 'reservation-detail',
  templateUrl: './reservation-detail.page.html',
  styleUrls: ['./reservation-detail.page.scss'],
})
export class ReservationDetailPage implements OnInit {
  reservationId = '';

  constructor(
    private route: ActivatedRoute,
    private reservationService: ReservationService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.reservationId = this.route.snapshot.paramMap.get('reservationId');
    this.getReservation();
    this.getMessages();
  }

  getReservation() {
    // get reservation from firestore
    console.log('in getReservation(reservation-detail.page.ts)');
    this.reservationService.getReservation(this.reservationId);
  }

  getMessages(){
    // get this reservation's messages from firestore.
    console.log('in getMessages(reservation-detail.page.ts)');
    this.messageService.getReservationMessages(this.reservationId);
  }

}
