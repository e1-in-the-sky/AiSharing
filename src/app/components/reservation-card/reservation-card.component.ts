import { Component, OnInit, Input } from '@angular/core';
import * as firebase from 'firebase';
import { Router } from '@angular/router';
import { Reservation } from '../../models/reservation';
import { User } from '../../models/user';
import { AlertController } from '@ionic/angular';
import { ReservationUsers } from '../../models/reservation-users';
import { AngularFirestore } from '@angular/fire/firestore';
import { ReservationUsersService } from '../../services/reservation_users/reservation-users.service';
import { ReservationService } from '../../services/reservation/reservation.service';

@Component({
  selector: 'reservation-card',
  templateUrl: './reservation-card.component.html',
  styleUrls: ['./reservation-card.component.scss'],
})
export class ReservationCardComponent implements OnInit {
  @Input()
  reservation: Reservation;
  user: User = new User();  // reservationのオーナー
  
  constructor(
    private db: AngularFirestore,
    public router: Router,
    public alertController: AlertController,
    private reservationService: ReservationService,
    private reservationUsersService: ReservationUsersService
  ) { }

  ngOnInit() {
    this.reservation.owner.get().then(doc => {this.user = new User(doc.data())});
  }

  goToReservationDetail() {
    // for reservation detail page
    // console.log(reservation);
    // console.log(reservation.owner);
    this.router.navigateByUrl('/app/tabs/reservations/detail/' + this.reservation.uid);
  }

  async goToAccountDetail() {
    // for account detail page
    var account_uid = this.reservation.owner.id;
    var path = '/account/' + account_uid;
    await firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // account_uidが自分だった場合はマイページに移動
        if (user.uid == account_uid) {
          path = '/mypage';
        }
      }
    });
    this.router.navigateByUrl(path);
  }

  async displayNorimasuAlert() {
    console.log('on ノリマス');
    var my_reservation = false;
    var myUserRef;

    await firebase.auth().onAuthStateChanged(user => {
      if (user) {
        myUserRef = this.db.collection('users').doc(user.uid).ref;
        if (user.uid == this.reservation.owner.id) { 
          // 自分の投稿だった場合
          my_reservation = true;
        }
      }
    });

    if (my_reservation) {
      // 自分の投稿だった場合
      const alert = await this.alertController.create({
        header: 'これは自分の投稿です！',
        // subHeader: 'Subtitle',
        message: 'This is my reservation.',
        buttons: ['OK']
      });
      await alert.present();
    } else {
      // 自分の投稿じゃない場合
      const alert = await this.alertController.create({
        header: '相乗り予約',
        inputs: [
          {
            name: 'passenger_count',
            type: 'number',
            placeholder: '乗車予定人数を入力してください',
            value: 1,
            min: 1,
            max: this.reservation.max_passenger_count - this.reservation.passenger_count
          },
          {
            name: 'comment',
            type: 'text',
            placeholder: 'コメント',
            value: 'よろしくお願いします。',
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel');
            }
          }, {
            text: 'ノリマス！',
            handler: data => {
              console.log('Confirm Ok');
              console.log('on ノリマス:', data);
              console.log('reservation:', this.reservation);
              this.onNorimasu(myUserRef, data).then(() => {}, error => {console.log(error)});
            }
          }
        ]
      });
      await alert.present();
    }
  }

  async onNorimasu(myUserRef, data) {
    data.passenger_count = parseInt(data.passenger_count);
    var reservationUsers: ReservationUsers
      = new ReservationUsers({
        user: myUserRef,
        reservation: this.db.collection('reservations').doc(this.reservation.uid).ref,
        passenger_count: data.passenger_count
      });
    
    console.log(this.reservation.passenger_count);
    console.log(data.passenger_count);
    console.log(this.reservation.max_passenger_count);

    // 自分がすでにノリマスしていたら更新するかのポップアップ

    // max_passenger_countを超えたら失敗
    if (this.reservation.passenger_count + data.passenger_count > this.reservation.max_passenger_count) {
      // passenger_countがmax_passenger_countを超えたら追加失敗
      const alert = await this.alertController.create({
        header: '最大乗車人数を超えてしまいます！',
        // subHeader: 'Subtitle',
        message: 'max passenger error!',
        buttons: ['OK']
      });
      await alert.present();
      throw new Error('max passenger error');
    }

    // reservationのpassenger_countの追加
    this.reservation.passenger_count += data.passenger_count;
    this.reservationService.updateReservation(this.reservation.uid, this.reservation)
      .then(() => {
        // reservationの更新に成功したらreservationUsersを追加
        this.reservationUsersService.addReservationUsers(reservationUsers)
          .then(() => {
            console.log('add reservation user is successful');
            this.router.navigateByUrl('/app/tabs/reservations/detail/' + this.reservation.uid);
          })
      });
  }

}
