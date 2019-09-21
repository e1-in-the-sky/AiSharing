import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import * as firebase from 'firebase';
import { UserService } from '../../services/user/user.service';
import { User } from '../../models/user';
import { ReservationService } from '../../services/reservation/reservation.service';
import { Reservation } from '../../models/reservation';
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { AccountIconService } from '../../services/account-icon/account-icon.service';
import { ReservationUsersService } from '../../services/reservation_users/reservation-users.service';
import { MypageEditPage } from '../mypage-edit/mypage-edit.page';

@Component({
  selector: 'route-search-list',
  templateUrl: './route-search-list.page.html',
  styleUrls: ['./route-search-list.page.scss'],
})
export class RouteSearchListPage implements OnInit {

  user: User = new User();

  indexOfSelectedLocation = 0;
  route_list = null;
  selected_route = null;
  selected_reservations = null;

  constructor(
    private navParams: NavParams,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private userService: UserService,
    private reservationService: ReservationService,
    private reservationUsersService: ReservationUsersService
    ) {
    this.route_list = navParams.get("routes");
    this.route_list = this.route_list.responses;
  }

  async ngOnInit() {
    let loading = await this.createLoading();
    loading.present();
    // await this.getCurrentUser();
    try {
      var firebaseUser = await this.getCurrentUser();
      this.user = await this.userService.getUser(firebaseUser.uid);
      loading.dismiss();
    } catch (err) {
      loading.dismiss();
      let alert = await this.createError(err);
      await alert.present();
      console.error(err);
    }

    await this.selectLocation();
  }

  async selectLocation(){
    this.selected_route = this.route_list[this.indexOfSelectedLocation];
    this.selected_reservations = [];
    for(var i in this.selected_route.logs){
      var log_reserve = this.selected_route.logs[i];
      console.log("log_reserve:", log_reserve);
      var reserve = await this.reservationService.getReservation(log_reserve.uid);
      console.log("reserve:", reserve);
      this.selected_reservations.push(reserve);
    }
  }


  async createLoading() {
    let loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: '読み込み中...'
    });
    return loading;
  }

  async getCurrentUser_() {
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

  async createError(err) {
    const alert = await this.alertController.create({
      header: 'エラーが発生しました',
      // subHeader: 'Subtitle',
      // message: err,
      buttons: ['OK']
    });
    return alert;
  }
}
