import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Reservation } from '../../models/reservation';
import { User } from '../../models/user';
import { ReservationUsers } from '../../models/reservation-users';
import { Message } from '../../models/message';
import { ReservationService } from '../../services/reservation/reservation.service';
import { UserService } from '../../services/user/user.service';
import { MessageService } from '../../services/message/message.service';
import { ReservationUsersService } from '../../services/reservation_users/reservation-users.service';
import { NavController, AlertController, ModalController, NumericValueAccessor } from '@ionic/angular';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'reservation-edit',
  templateUrl: './reservation-edit.page.html',
  styleUrls: ['./reservation-edit.page.scss'],
})
export class ReservationEditPage implements OnInit {
  @Input() reservationId: string;
  reservation: Reservation = new Reservation();
  reservation_owner: User = new User();
  reservationUsers: ReservationUsers[] = [];
  messages: Message[] = [];
  condition: boolean = true;
  min_passenger_count: number;
  index_owner: number;

  departure_time: string = '';

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private userService: UserService,
    private messageService: MessageService,
    private reservationUsersService: ReservationUsersService,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private datepipe: DatePipe
  ) { }

  // 自分の投稿でないときは編集できないようにしないといけない
  ngOnInit() {
    // this.reservationId = this.route.snapshot.paramMap.get('reservationId');
    Promise.all([
      new Promise((resolve, reject) => {
        this.getReservation().then(() => {
          resolve(this.getReservationOwner());
        })
      }),
      new Promise((resolve, reject) => {
        resolve(this.getReservationUsers());
      })
    ]).then(() =>{
      this.index_owner = this.reservationUsers.findIndex(reservationUser => reservationUser.user.id === this.reservation.owner.id);
      console.log(this.index_owner);
      this.min_passenger_count = this.reservation.passenger_count;
      if(this.index_owner != -1){
        this.min_passenger_count = this.reservation.passenger_count - this.reservationUsers[this.index_owner].passenger_count + 1;
      }
    });
    this.getReservation().then(() => {
      this.getReservationOwner();
    });
    this.getReservationUsers();
    this.getMessages();
  }
  //var firebaseUser = await this.getCurrentUser();
  //var currentUser = await this.userService.getUser(firebaseUser.uid);

  //// すでにノリマスを押した人の一覧にカレントユーザーがいないか確認
  //var reservationUsers: ReservationUsers[] = await this.reservationUsersService.
  //getReservationUsersByReservationUid(this.reservation.uid);
  //var indexOfAlredyNorimasu: number = reservationUsers.findIndex(reservationUser => reservationUser.user.id === currentUser.uid);

  async getReservation() {
    // get reservation
    await this.reservationService
      .getReservation(this.reservationId)
      .then(reservation => {
        this.reservation = reservation;
        this.departure_time = this.datepipe.transform(reservation.departure_time.toDate(), 'yyyy-MM-dd HH:mm');
      });
  }

  async getReservationOwner() {
    // get reservation owner
    await this.userService
      .getUser(this.reservation.owner.id)
      .then(user => {
        this.reservation_owner = user;
      });
  }

  async getReservationUsers() {
    // get ReservationUsers array
    await this.reservationUsersService
      .getReservationUsersByReservationUid(this.reservationId)
      .then(reservationUsers => {
        this.reservationUsers = reservationUsers;
      });
  }

  async getMessages() {
    // get Message array of this reservation
    await this.messageService
      .getReservationMessages(this.reservationId)
      .then(messages => {
        this.messages = messages;
      });
  }

  conditionChanged(ev: any) {
    console.log('ev:', ev);
    console.log('ev.target:', ev.target);
  }

  async onUpdate() {
    console.log('on update\nreservation:', this.reservation);
    const alert = await this.alertController.create({
      header: '確認',
      message: 'この投稿を更新しますか？',
      buttons: [
        {
          text: '更新',
          handler: () => {
            console.log('Confirm update');
            this.updateReservation();
          }
        }, {
          text: 'キャンセル',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }
      ]
    });
    await alert.present();
  }

  async updateReservation() {
    if (this.index_owner != -1) {
      try {
        await this.reservationUsersService.updateReservationUsers(this.reservationUsers[this.index_owner].uid, this.reservationUsers[this.index_owner]);
      } catch (err) {
        console.error("updateReservationUsers in reservation-edit.page.ts\nerr:", err);
        throw err;
      }
    }
    this.reservation.updated_at = new Date();
    this.reservation.departure_time = new Date(this.departure_time);
    try {
      await this.reservationService.updateReservation(this.reservation.uid, this.reservation);
    } catch (err) {
      console.error('updateReservation in reservation-edit.page.ts:\nerr:', err);
      throw err;
    }
    this.dismissModal(true);
    console.log('投稿の更新に成功しました。');
  }

  async onDelete() {
    console.log('on delete');
    this.presentDeleteConfirm();
  }

  onCancel() {
    console.log('on cancel');
    // this.navCtrl.navigateBack('/app/tabs/reservations/detail/' + this.reservation.uid);
    this.dismissModal(false);
  }

  async onDeleteReservationUser(reservationUser_uid: string) {
    console.log('on delete\nreservationUser_uid:', reservationUser_uid);
    const alert = await this.alertController.create({
      header: '確認',
      message: '本当にこのユーザーを削除しますか？',
      buttons: [
        {
          text: '削除',
          handler: () => {
            console.log('Confirm delete');
            this.deleteReservationUser(reservationUser_uid);
          }
        }, {
          text: 'キャンセル',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteReservationUser(reservationUser_uid: string) {
    this.reservationUsersService
      .deleteReservationUsers(reservationUser_uid)
      .then(() => {
        this.getReservation();
        this.getReservationUsers();
      });
  }

  async onDeleteMessage(message_uid: string) {
    console.log('on message delete\nmessage_uid:', message_uid);
    const alert = await this.alertController.create({
      header: '確認',
      message: '本当にこのメッセージを削除しますか？',
      buttons: [
        {
          text: '削除',
          handler: () => {
            console.log('Confirm delete');
            this.deleteMessage(message_uid);
          }
        }, {
          text: 'キャンセル',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }
      ]
    });
    await alert.present();
  }

  deleteMessage(message_uid) {
    this.messageService
      .deleteMessage(message_uid)
      .then(() => {
        this.getMessages();
      });
  }

  async deleteReservation() {
    // delelte reservation
    await this.reservationService.deleteReservation(this.reservationId)
      .then(async () => {
        // 投稿の削除に成功したら
        // 成功したポップアップを表示
        await this.presentDeleteIsSuccessful();
        // 投稿一覧ページに移動
        console.log('move to reservation list page');
        this.dismissModal(false);
        this.router.navigateByUrl('/app/tabs/reservations');
      });
  }

  async presentDeleteConfirm() {
    const alert = await this.alertController.create({
      header: '確認',
      message: '本当にこの投稿を削除しますか？',
      buttons: [
        {
          text: '削除',
          handler: () => {
            console.log('Confirm delete');
            this.deleteReservation();
          }
        }, {
          text: 'キャンセル',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }
      ]
    });
    await alert.present();
  }

  async presentDeleteIsSuccessful() {
    const alert = await this.alertController.create({
      header: '確認',
      message: '投稿を削除しました',
      buttons: ['OK']
    });
    await alert.present();
  }

  dismissModal(isUpdate: boolean = false) {
    this.modalCtrl.dismiss({
      "isUpdate": isUpdate
    });
  }

  on_change_passenger_count(x) {
    let dif = this.reservation.passenger_count;
    this.reservation.passenger_count = this.clamp(this.reservation.passenger_count + x, this.min_passenger_count, this.reservation.max_passenger_count);
    dif = this.reservation.passenger_count - dif;
    this.reservationUsers[this.index_owner].passenger_count += dif;
  }

  on_change_max_passenger_count(x) {
    this.reservation.max_passenger_count = this.clamp(this.reservation.max_passenger_count + x, this.reservation.passenger_count, 100);
  }


  clamp(x, min, max) {
    return Math.max(Math.min(x, max), min);
  }

}
