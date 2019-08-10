import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { UserService } from '../../services/user/user.service';
import { User } from '../../models/user';
import { ReservationService } from '../../services/reservation/reservation.service';
import { Reservation } from '../../models/reservation';
import { NavController } from '@ionic/angular';
import { AccountIconService } from '../../services/account-icon/account-icon.service';

@Component({
  selector: 'mypage',
  templateUrl: './mypage.page.html',
  styleUrls: ['./mypage.page.scss'],
})
export class MypagePage implements OnInit {
  user: User = new User();
  reservations: Reservation[] = [];

  constructor(
    private navCtrl: NavController,
    private userService: UserService,
    private reservationService: ReservationService,
  ) { }

  async ngOnInit() {
    await this.getCurrentUser();
    await this.getMyReservations();
    await this.getRideReservations();
  }

  async getCurrentUser() {
    // get current user information from firestore.
    await firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // User is signed in.
        this.userService.getUser(user.uid).then(user => {
        this.user = user;
        });
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
  }

  getRideReservations() {
    // get reserved reservations
    console.log('getRideReservations in mypage.page.ts');
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // if signin
        this.reservationService.getRideReservations(user.uid);
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
