import { Component, OnInit } from '@angular/core';
import { Reservation } from '../../models/reservation';
import { User } from '../../models/user';
import { ReservationService } from '../../services/reservation/reservation.service';
import { Router } from '@angular/router';
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular'


import * as firebase from 'firebase';

import { ReservationPostPage } from '../reservation-post/reservation-post.page';
import { ReservationFilterPage } from '../reservation-filter/reservation-filter.page';

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
  today = new Date();
  filter;

  constructor(
    private reservationService: ReservationService,
    public router: Router,
    // private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    public modalController: ModalController
  ) {  }

  async ngOnInit() {
    // this.today.setHours(0);
    // this.today.setMinutes(0);
    // this.today.setSeconds(0);

    this.filter = {
      departure_name: '',
      destination_name: '',
      // departure_time_day: this.today,
      // departure_time_start: this.today, // 現在
      departure_time_start: new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 0, 0),
      departure_time_end: new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 23, 59),
      condition: '募集中',
      sort: '出発予定時刻が早い順',
      passenger_capacity: 1
    };
    // this.getReservations();
    // this.reservations = this.reservationService.getReservations();
    console.log("ngoninit")
    this.getLoginStatus();
    this.getReservationsAndFilterWithLoading();
  }

  async doRefresh(event) {
    // await this.getReservations();
    console.log("dorefresh")
    this.getReservationsAndFilterWithLoading();
    event.target.complete();
  }

  async getReservationsAndFilterWithLoading() {
    let loading = await this.createLoading();
    await loading.present();

    try {
      await this.getReservations();
      this.applyFilterToReservations();
      // this.DisplayReservations();
      loading.dismiss();
    
    } catch (err) {
      loading.dismiss();
      let alert = await this.createError(err);
      await alert.present();
    }
  }

  
  async getReservations() {
    try {
      this.reservations = await this.reservationService.getReservations();
    
    } catch (err) {
      throw err;
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
        this.router.navigateByUrl('/login');
      }
    });
  }

  // async goToPost() {
  //   // this.router.navigateByUrl('/app/tabs/reservations/post');
  //   const modal = await this.modalController.create({
  //     component: ReservationPostPage
  //   });
  //   await modal.present();
  //   const { data } = await modal.onWillDismiss();
  //   if (data.isUpdate) {
  //     console.log(data);
  //     this.getReservationsAndFilterWithLoading();
  //   }
  // }

  async createReservationFilterModal() {
    const modal = await this.modalController.create({
      component: ReservationFilterPage,
      componentProps: {
        'filter': this.filter
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.filter = data.filter;
      this.getReservationsAndFilterWithLoading();
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
    let alert = await this.alertCtrl.create({
      header: 'エラー',
      // subHeader: 'Subtitle',
      message: err,
      buttons: ['OK']
    });
    return alert;
  }

  trackFn(index: any, reservation: Reservation) {
    return reservation.uid;
  }

  // 出発時刻によるソート
  // order: string (asc or des)
  // ascの場合は出発時刻が早い順
  // desの場合は出発時刻が遅い順
  sortReservationsByDepartureTime(order: string = "asc") {
    if ( order === "asc" ) {  // 出発時刻が早い順
      this.reservations = this.reservations.sort((a, b) => {
        return a.departure_time > b.departure_time ? 1 : -1;
      });
    } else if (order === "des") {  // 出発時刻が遅い順
      this.reservations = this.reservations.sort((a, b) => {
        return a.departure_time < b.departure_time ? 1 : -1;
      });
    }
  }

  // 投稿時刻によるソート
  // order: string (asc or des)
  // ascの場合は投稿時刻が(早い順)(近い順)
  // desの場合は投稿時刻が(遅い順)(遠い順)
  sortReservationsByCreatedAt(order: string = "asc") {
    if (order === "asc") {
      this.reservations = this.reservations.sort((a, b) => {
        return a.created_at < b.created_at ? 1 : -1;
      });
    } else if (order === "des") {
      this.reservations = this.reservations.sort((a, b) => {
        return a.created_at > b.created_at ? 1 : -1;
      });
    }
  }

  // 出発地による絞り込み
  // departure_name: string (絞り込む出発地の名前)
  filterReservationsByDepartureName(departure_name: string) {
    this.reservations
      = this.reservations.filter(reservation => reservation.departure_name === departure_name);
  }

  // 目的地による絞り込み
  // destination_name: string (絞り込む目的地の名前)
  filterReservationsByDestinationName(destination_name: string) {
    this.reservations
      = this.reservations.filter(reservation => reservation.destination_name === destination_name);
  }

  // 募集状況による絞り込み
  // condition: string (募集状況: 募集中 or 募集終了)
  filterReservationsByCondition(condition: string = "募集中") {
    if (condition !== 'すべて'){
      this.reservations
        = this.reservations.filter(reservation => reservation.condition === condition);
    }
  }

  // 乗車可能人数による絞り込み
  // passenger_capacityより乗車可能人数が多い投稿に絞り込む
  // passenger_capacity: number (乗車可能人数)
  filterReservationsByPassengerCapacity(passenger_capacity: number) {
    this.reservations
      = this.reservations.filter(reservation => reservation.max_passenger_count - reservation.passenger_count >= passenger_capacity);
  }

  // filterReservationsByDepartureDate(start_time: Date){
  //   var start_time_timestamp = firebase.firestore.Timestamp.fromDate(start_time);
  //   var displaydate_end = new Date(start_time.getFullYear(), start_time.getMonth(), start_time.getDate(), start_time.getHours()+23, start_time.getMinutes()+59, start_time.getSeconds()+59)
  //   var end_time_timestamp = firebase.firestore.Timestamp.fromDate(displaydate_end);    
    
  //   console.log("today=" + start_time)
  //   console.log("displaydate_end=" + displaydate_end)

  //   this.reservations
  //     = this.reservations.filter(reservation =>
  //       (reservation.departure_time > start_time_timestamp) && (reservation.departure_time < end_time_timestamp));
  //   }   


  // 出発予定時刻の期間による絞り込み
  // 出発予定時刻がstart_timeからend_timeの期間にある投稿に絞り込む
  // start_time: Date
  // end_time: Date
  filterReservationsByDepartureTime(start_time: Date, end_time: Date) {
    
    var start_time_timestamp = firebase.firestore.Timestamp.fromDate(start_time);
    var end_time_timestamp = firebase.firestore.Timestamp.fromDate(end_time);
    
    this.reservations
      = this.reservations.filter(reservation =>
        (reservation.departure_time > start_time_timestamp) && (reservation.departure_time < end_time_timestamp));
    }   


  
  // this.filterで定義されている絞り込みを適用する
  applyFilterToReservations() {
    // filter内の募集状況が"すべて"でないとき募集状況で絞り込む
    if (this.filter.condition !== 'すべて') {
      this.filterReservationsByCondition(this.filter.condition);
    }

    // filter内の出発地が空でないとき出発地で絞り込む
    if (this.filter.departure_name) {
      this.filterReservationsByDepartureName(this.filter.departure_name);
    }

    // filter内の目的地が空でないとき目的地で絞り込む
    if (this.filter.destination_name) {
      this.filterReservationsByDestinationName(this.filter.destination_name);
    }

    // filter内の乗車可能人数で絞り込む
    this.filterReservationsByPassengerCapacity(this.filter.passenger_capacity);

    // filter内の出発期間で絞り込む
    console.log('departure_time_start:', this.filter.departure_time_start);
    console.log('departure_time_end:', this.filter.departure_time_end);
    this.filterReservationsByDepartureTime(this.filter.departure_time_start, this.filter.departure_time_end);

    // filter内のソート条件でソートする
    switch (this.filter.sort) {
      case "出発予定時刻が早い順":
        this.sortReservationsByDepartureTime("asc");
        break;
      case "出発予定時刻が遅い順":
        this.sortReservationsByDepartureTime("des");
        break;
      case "投稿が新しい順":
        this.sortReservationsByCreatedAt("asc");
        break;
      case "投稿が古い順":
        this.sortReservationsByCreatedAt("des");;
        break;
    }
  }
  
  toDate(ev) {
    return new Date(ev);
  }

  
  // async DisplayReservations() {
  //   await this.getReservations();
  //   console.log("DisplayReservations")
    
  //   var start_time_timestamp = firebase.firestore.Timestamp.fromDate(this.today);
  //   var displaydate_end = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), this.today.getHours()+11, this.today.getMinutes()+59, this.today.getSeconds()+59)
  //   var end_time_timestamp = firebase.firestore.Timestamp.fromDate(displaydate_end);    
    
  //   console.log("today=" + this.today)
  //   console.log("displaydate_end=" + displaydate_end)

  //   this.reservations
  //     = this.reservations.filter(reservation =>
  //       (reservation.departure_time > start_time_timestamp) && (reservation.departure_time < end_time_timestamp));
  // }
}
