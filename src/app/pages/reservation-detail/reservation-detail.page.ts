import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../services/message/message.service';
import { ReservationService } from '../../services/reservation/reservation.service';
import { Reservation } from '../../models/reservation';
import { ReservationUsersService } from '../../services/reservation_users/reservation-users.service';
import { User } from '../../models/user';
import { Message } from '../../models/message';
import * as firebase from 'firebase';
import { UserService } from '../../services/user/user.service';
import { ReservationUsers } from '../../models/reservation-users';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'reservation-detail',
  templateUrl: './reservation-detail.page.html',
  styleUrls: ['./reservation-detail.page.scss'],
})
export class ReservationDetailPage implements OnInit {
  owner_name: string = '';
  reservationId: string = '';
  reservation: Reservation = new Reservation();
  reservation_owner: User = new User();
  departure_name: string = '';
  departure_time_date: string = '';
  reservationUsers: ReservationUsers[] = [];
  messages: Message[] = [];
  message: string = '';
  is_my_reservation: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private reservationService: ReservationService,
    private messageService: MessageService,
    private userService: UserService,
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
      console.log('reservation departure_time:', reservation.departure_time, '\n',
                  'reservation departure_time class name:', reservation.departure_time.constructor.name, '\n',
                  'reservation departure_time.seconds:', reservation.departure_time.seconds, '\n',
                  'reservation departure_time.toDate():', reservation.departure_time.toDate());
      this.reservation = reservation;
      this.departure_time_date = reservation.departure_time.toDate();
      reservation.owner.get()
        .then(doc => {
          this.reservation_owner = new User(doc.data());
          this.owner_name = doc.data().name
          this.checkMyReservation();
        });
      this.departure_name = reservation.departure_name;
    });
  }

  getMessages(){
    // get this reservation's messages from firestore.
    console.log('in getMessages(reservation-detail.page.ts)');
    this.messageService.getReservationMessages(this.reservationId).then(messages => {this.messages = messages});
  }

  async sendMessage() {
    console.log('sendMessage:\nmessage:', this.message);
    var myuser_id: string;
    await firebase.auth().onAuthStateChanged(user => {
      if (user) {
        myuser_id = user.uid;
      } else {
        // ログインしていない場合
        // ログインしてくださいのポップアップ
      }
    });
    // create message
    var user_ref;
    await this.userService.getUserRef(myuser_id).then(_user_ref => {user_ref = _user_ref});
    var reservation_ref;
    await this.reservationService.getReservationRef(this.reservationId).then(_reservation_ref => {reservation_ref = _reservation_ref});
    var created_at = new Date();
    var updated_at = created_at;
    var message: Message
      = new Message({
        message: this.message,
        user: user_ref,
        reservation: reservation_ref,
        created_at: created_at,
        updated_at: updated_at
      });
    // send message
    this.messageService
      .addMessage(message)
      .then(() => {
        // メッセージの追加が成功した時
        // reset message form
        this.message = '';
        // get new messages

        this.getMessages();
      });
  }

  async checkMyReservation() {
    // check this reservation is my posted reservation.
    console.log('checkMyResevation in reservation-detail.page.ts)\nthis.reservationId:', this.reservationId);
    await firebase.auth().onAuthStateChanged(user => {
      this.is_my_reservation = user.uid == this.reservation.owner.id;
    });
    return this.is_my_reservation;
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

  goToEditPage() {
    console.log('go to edit page');
    // this.router.navigate
    this.navCtrl.navigateForward('/app/tabs/reservations/edit/' + this.reservation.uid);
  }

}
