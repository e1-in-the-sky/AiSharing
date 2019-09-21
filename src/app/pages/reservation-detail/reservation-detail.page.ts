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
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { ReservationEditPage } from '../reservation-edit/reservation-edit.page';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'reservation-detail',
  templateUrl: './reservation-detail.page.html',
  styleUrls: ['./reservation-detail.page.scss'],
})
export class ReservationDetailPage implements OnInit {
  current_user: User = new User();
  owner_name: string = '';
  reservationId: string = '';
  // reservation: Reservation;
  reservation: Reservation = new Reservation();
  reservation_owner: User = new User();
  departure_name: string = '';
  departure_time_date: string = '';
  reservationUsers: ReservationUsers[] = [];
  messages: Message[] = [];
  message: string = '';
  is_my_reservation: boolean = false;
  unsubscribeMessages: any;
  unsubscribeReservationUsers: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private reservationService: ReservationService,
    private messageService: MessageService,
    private userService: UserService,
    private reservationUsersService: ReservationUsersService,
    private db: AngularFirestore
  ) { }

  async ngOnInit() {
    let loading = await this.createLoading();
    loading.present();

    try {
      this.reservationId = this.route.snapshot.paramMap.get('reservationId');
      var current_user = await this.getCurrentUser();
      this.current_user = await this.userService.getUser(current_user.uid);
      this.getReservation();
      // this.getMessages();  // comment out
      this.onSnapshotReservationMessage(this.reservationId);
      // this.getThisReservationUsers();
      this.onSnapshotReservationUsersByReservationUid(this.reservationId);
      loading.dismiss();

    } catch (err) {
      loading.dismiss();
      const alert = await this.createError(err);
      await alert.present();
    }
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave');
    // console.log('unsubscribeMessages', this.unsubscribeMessages);
    // console.log('unsubscribeReservationUsers', this.unsubscribeReservationUsers);
    // this.unsubscribeMessages();
    // this.unsubscribeReservationUsers();
  }

  getCurrentUser(): firebase.User | Promise<firebase.User> {
    return new Promise((resolve, reject) => {
      firebase.auth().onAuthStateChanged((user: firebase.User) => {
        if (user) {
          resolve(user);
        } else {
          console.log('User is not logged in');
          // resolve(false);
          reject();
        }
      });
    });
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

  async getMessages(){
    // get this reservation's messages from firestore.
    console.log('in getMessages(reservation-detail.page.ts)');
    this.messages = await this.messageService.getReservationMessages(this.reservationId);
    this.messages = await this.messages.sort((a, b) => {
      return a.created_at > b.created_at ? 1 : -1;
    });
  }

  async onSnapshotReservationMessage(reservation_uid) {
    console.log('getReservationMessages:\nreservation_uid:', reservation_uid);
    var reservation_ref = this.db.collection('reservations').doc(reservation_uid).ref;
    var messages_ref = this.db.collection('messages').ref;
    return messages_ref
      .where('reservation', '==', reservation_ref)
      .onSnapshot((querySnapShot) => {
        var messages: Message[] = [];
        querySnapShot.forEach(doc => {
          messages.push(new Message(doc.data()));
        });
        this.messages = messages.sort((a, b) => {
          return a.created_at > b.created_at ? 1 : -1;
        });
      });
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

        // this.getMessages();  // comment out
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

  async onSnapshotReservationUsersByReservationUid(reservation_uid) {
    // Get ReservationUser list by reservation_uid
    var reservationUsersRef = await this.db.collection('reservations_users').ref;
    var reservationRef = await this.db.collection('reservations').doc(reservation_uid).ref;
    // var users: User[] = [];
    // await reservationUsersRef.where('reservation', '==', reservationRef).get()
    //   .then(querySnapshot => {
    //     querySnapshot.forEach(doc => {
    //       reservationUsers.push(new ReservationUsers(doc.data()));
    //       console.log(doc.id, "=>", doc.data());
    //     });
    //   });
    // return reservationUsers;
    reservationUsersRef.where('reservation', '==', reservationRef).onSnapshot(querySnapshot => {
      var reservationUsers: ReservationUsers[] = [];
      querySnapshot.forEach(doc => {
        reservationUsers.push(new ReservationUsers(doc.data()));
        // console.log(doc.id, "=>", doc.data());
      });
      this.reservationUsers = reservationUsers;
    });
  }

  // getReservationsUsers() {
  //   this.reservationUsersService.getReservationsUsers().then(reservationsUsers => {
  //     console.log('reservations users:', reservationsUsers);
  //   });
  // }

  async goToEditPage() {
    console.log('go to edit page');
    // this.router.navigate
    // this.navCtrl.navigateForward('/app/tabs/reservations/edit/' + this.reservation.uid);
    const modal = await this.modalCtrl.create({
      component: ReservationEditPage,
      componentProps: {
        'reservationId': this.reservationId,
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data.isUpdate) {
      console.log(data);
      let loading = await this.createLoading();
      await loading.present();
      try {
        var current_user = await this.getCurrentUser();
        this.current_user = await this.userService.getUser(current_user.uid);
        this.getReservation();
        // this.getMessages();  // comment out
        // this.getThisReservationUsers(); comment out
        loading.dismiss();
      
      } catch (err) {
        loading.dismiss();
        let alert = await this.createError(err);
        await alert.present();
      }
    }
  }

  async createLoading() {
    let loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: '読み込み中...'
    });
    return loading;
  }

  async createError(err) {
    const alert = await this.alertCtrl.create({
      header: 'エラー',
      // subHeader: 'Subtitle',
      // message: err,
      buttons: ['OK']
    });
    console.error(err);
    return alert;
  }
}
