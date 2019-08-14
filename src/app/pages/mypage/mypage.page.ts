import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { UserService } from '../../services/user/user.service';
import { User } from '../../models/user';
import { ReservationService } from '../../services/reservation/reservation.service';
import { Reservation } from '../../models/reservation';
import { NavController, LoadingController } from '@ionic/angular';
import { AccountIconService } from '../../services/account-icon/account-icon.service';
import { ReservationUsersService } from '../../services/reservation_users/reservation-users.service';

@Component({
  selector: 'mypage',
  templateUrl: './mypage.page.html',
  styleUrls: ['./mypage.page.scss'],
})
export class MypagePage implements OnInit {
  user: User = new User();
  reservations: Reservation[] = [];
  rideReservations: Reservation[] = [];

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private userService: UserService,
    private reservationService: ReservationService,
    private reservationUsersService: ReservationUsersService
  ) { }

  async ngOnInit() {
    let loading = await this.loadingCtrl.create({
      // spinner: 'circles',
      message: '読み込み中...'
    });
    loading.present();
    await this.getCurrentUser();
    await this.getMyReservations();
    await this.getRideReservations();
    loading.dismiss();
  }

  async getCurrentUser() {
    // get current user information from firestore.
    await firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        // User is signed in.
        this.user = await this.userService.getUser(user.uid);
      } else {
        // ログインしていないとき
      }
    });
  }

  async getMyReservations() {
    // get current user posted reservations from firestore.
    console.log('getMyReservations in mypage.page.ts');
    await firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // ログインしているとき
        this.reservationService
          .getUserReservations(user.uid)
          .then(reservations => {
            this.reservations = reservations;
          });
      } else {
        // ログインしていないとき
      }
    });
    
    // console.log(this.user);
    // console.log(this.user.uid);
    // this.reservations = await this.reservationService.getUserReservations(this.user.uid);
  }

  async getRideReservations() {
    // get reserved reservations
    console.log('getRideReservations in mypage.page.ts');
    await firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        // if signin
        // this.reservationService.getRideReservations(user.uid);
        this.rideReservations = await this.reservationUsersService.getReservationsByUserUid(user.uid);
        console.log('rideReservations in getRideReservations:', this.rideReservations);
      } else {
        // if not sign in
      }
    });
  }

  editProfile() {
    // edit my profile or go to edit page of my profille.
    console.log('editProfile in mypage.page.ts');
  }

  goToEditPage() {
    console.log('go to edit page');
    this.navCtrl.navigateForward('/mypage/edit');
  }

}
