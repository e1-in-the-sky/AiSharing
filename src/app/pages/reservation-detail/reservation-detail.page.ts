import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message/message.service';
import { ReservationService } from '../../services/reservation/reservation.service';
import { Reservation } from '../../models/reservation';
import { ReservationUsersService } from '../../services/reservation_users/reservation-users.service';
import { User } from '../../models/user';
import { Message } from '../../models/message';

@Component({
  selector: 'reservation-detail',
  templateUrl: './reservation-detail.page.html',
  styleUrls: ['./reservation-detail.page.scss'],
})
export class ReservationDetailPage implements OnInit {
  owner_name: string = '';
  reservationId: string = '';
  departure_name: string = '';
  reservationUsers: User[] = [];
  messages: Message[] = [];

  constructor(
    private route: ActivatedRoute,
    private reservationService: ReservationService,
    private messageService: MessageService,
    private reservationUsersService: ReservationUsersService
  ) { }

  ngOnInit() {
    this.reservationId = this.route.snapshot.paramMap.get('reservationId');
    this.getReservation();
    this.getMessages();
    this.getThisReservationUsers();
  }

  getReservation() {
    // get reservation from firestore
    console.log('in getReservation(reservation-detail.page.ts)\nreservationId:', this.reservationId);
    this.reservationService.getReservation(this.reservationId).then(reservation => {
      console.log('in getReservation(reservation-detail.page.ts)\nreservation:', reservation);
      reservation.owner.get().then(doc => {this.owner_name = doc.data().name})
      this.departure_name = reservation.departure_name;
    });
  }

  getMessages(){
    // get this reservation's messages from firestore.
    console.log('in getMessages(reservation-detail.page.ts)');
    this.messageService.getReservationMessages(this.reservationId);
  }

  checkMyReservation() {
    // check this reservation is my posted reservation.
    console.log('checkMyResevation in reservation-detail.page.ts)\nthis.reservationId:', this.reservationId); 
  }

  editReservation() {
    // edit reservation or go to edit page this reservation.
    console.log('editReservation in reservation-detail.page.ts)\nthis.reservationId:', this.reservationId);
  }

  getReservationUsers() {
    this.reservationUsersService.getReservationUsers(this.reservationId).then(reservationUsers => {
      console.log('reservation users:', reservationUsers);
    });
  }

  async getThisReservationUsers() {
    await this.reservationUsersService.getReservationUsersByReservationUid(this.reservationId)
      .then(reservationUsers => {
        console.log('reservation users:', reservationUsers);
        this.reservationUsers = reservationUsers;
      });
  }

  getReservationsUsers() {
    this.reservationUsersService.getReservationsUsers().then(reservationsUsers => {
      console.log('reservations users:', reservationsUsers);
    });
  }

}
