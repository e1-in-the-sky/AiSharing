import { Component, OnInit } from '@angular/core';
import { Reservation } from '../../models/reservation';
import { User } from '../../models/user';
import { ReservationService } from '../../services/reservation/reservation.service';
import { Router } from '@angular/router';
import { NavController, LoadingController } from '@ionic/angular'


import * as firebase from 'firebase';

@Component({
  selector: 'reservation-list',
  templateUrl: './reservation-list.page.html',
  styleUrls: ['./reservation-list.page.scss'],
})
export class ReservationListPage implements OnInit {
  // user1 = new User('1', 'm21@u-aizu', 'pass', 'aihara', '../../../assets/img/speakers/bear.jpg', 'hello!');
  // reservation1 = new Reservation(this.user1, '会津大学', '会津若松駅', '18:00', 1, '募集中', '募集してまーす', [], '10:00');
  // user2 = new User('2', 'm21@u-', 'passwd', 'user2', '../../../assets/img/speakers/cheetah.jpg', 'I\'m user2.');
  // reservation2 = new Reservation(this.user2, '会津若松駅', '鶴ケ城', '10:00', 2, '募集中', '鶴ヶ城に行きます', [], '9:00');
  // user3 = new User('3', 'user3@g', 'pw', 'user3', '../../../assets/img/speakers/duck.jpg', 'I\'m user3');
  // reservation3 = new Reservation(this.user3, '中央病院', '一箕町', '15:00', 1, '募集中', '病院から帰ります', [], '14:30');
  // reservations: Reservation[] = [this.reservation1, this.reservation2, this.reservation3];
  reservations: Reservation[] = [];
  isLogin: Boolean = false;

  constructor(
    private reservationService: ReservationService,
    public router: Router,
    private loadingCtrl: LoadingController
  ) {  }

  async ionViewWillEnter(){
    let loading = await this.loadingCtrl.create({
      // spinner: 'circles',
      message: '読み込み中...'
    });
    loading.present();
    await this.getReservations();
    loading.dismiss();
  }

  ngOnInit() {
    // this.getReservations();
    // this.reservations = this.reservationService.getReservations();

    this.getLoginStatus();
  }

  async getReservations() {
    try {
      this.reservations = await this.reservationService.getReservations()
    } catch (err) {
      throw err
    }
  }

  serchReservations(key) {
    // for serch reservations related to key. use by serchbar.
  }

  onRideTogether() {
    // on button action for ノリマス
  }

  getLoginStatus() {
    // for modify this login status
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.isLogin = true;
      } else {
        this.isLogin = false;
      }
    });
  }

  goToPost() {
    this.router.navigateByUrl('/app/tabs/reservations/post');
  }
}
