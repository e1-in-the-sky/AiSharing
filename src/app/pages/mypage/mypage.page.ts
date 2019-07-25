import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { UserService } from '../../services/user/user.service';
import { User } from '../../models/user';
import { ReservationService } from '../../services/reservation/reservation.service';

@Component({
  selector: 'mypage',
  templateUrl: './mypage.page.html',
  styleUrls: ['./mypage.page.scss'],
})
export class MypagePage implements OnInit {
  user: User;
  uid: string;
  displayName: string;
  email: string;
  introduction: string = '';
  imageURL: string = '';

  constructor(
    private userService: UserService,
    private reservationService: ReservationService
  ) { }

  ngOnInit() {
    this.getCurrentUser();
    this.getMyReservations();
  }

  getCurrentUser() {
    // get current user information from firestore.
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // User is signed in.
        this.userService.getUser(user.uid).then(user => {
        this.user = user;
        this.uid = user.uid;
        this.displayName = user.name;
        this.introduction = user.introduction;
        this.imageURL = user.imageURL;
        });
      } else {
        // ログインしていないとき
      }
    });
  }

  getMyReservations() {
    // get current user posted reservations from firestore.
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // ログインしているとき
        this.reservationService.getUserReservations(user.uid);
      } else {
        // ログインしていないとき
      }
    });
  }

}
