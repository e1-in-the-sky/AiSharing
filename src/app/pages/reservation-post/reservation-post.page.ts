import { Component, OnInit, ModuleWithComponentFactories } from '@angular/core';
import { Reservation } from '../../models/reservation';

import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';
import { ReservationService } from '../../services/reservation/reservation.service';
import { NavController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Title } from '@angular/platform-browser';
import { DatePipe } from '@angular/common'
import { YahooService } from '../../services/yahoo/yahoo.service';

@Component({
  selector: 'reservation-post',
  templateUrl: './reservation-post.page.html',
  styleUrls: ['./reservation-post.page.scss'],
})
export class ReservationPostPage implements OnInit {
  data: {
    departure_name: string,
    destination_name: string,
    departure_point: firebase.firestore.GeoPoint,
    destination_point: firebase.firestore.GeoPoint,
    departure_time: string,
    max_passenger_count: number,
    passenger_count: number,
    comment: string,
    condition: string,
    created_at: Date | firebase.firestore.Timestamp,
    updated_at: Date | firebase.firestore.Timestamp
  } = {
      departure_name: '',
      destination_name: '',
      departure_point: new firebase.firestore.GeoPoint(0, 0),
      destination_point: new firebase.firestore.GeoPoint(0, 0),
      departure_time: '',
      max_passenger_count: 4,
      passenger_count: 1,
      comment: 'よろしくお願いします。',
      condition: '募集中',
      created_at: new Date(),
      updated_at: new Date()
    };

  default_mapimg_option = {
    lat: 35.681093831866455,
    lon: 139.76716278230535,
    z: 17,
    width: 300,
    height: 200,
    pointer: 'on'
  };
  
  // departure_img_url: string = "https://map.yahooapis.jp/map/V1/static?appid=dj00aiZpPTM0eVQwUUlPM0s0VSZzPWNvbnN1bWVyc2VjcmV0Jng9ZDI-&lat=35.681093831866455&lon=139.76716278230535&z=17&width=300&height=200&pointer=on";
  // departure_img_url: string = "";
  // departure_img_url: string = this.yahooService.get_mapimg_url({
  //   lat: 35.681093831866455,
  //   lon: 139.76716278230535,
  //   z: 17,
  //   width: 300,
  //   height: 200,
  //   pointer: 'on'
  // });

  // 出発地に関しての情報
  checkInputDepartureInterval: NodeJS.Timer;
  departureLocalInfo: any = {};
  indexOfSelectedDepatureLocation: number = 0;
  departureLocationMapImageUrl: string = '';
  selectedDepartureAddress: string = '';

  // 目的地に関しての情報
  checkInputDestinationInterval: NodeJS.Timer;
  destinationLocalInfo: any = {};
  indexOfSelectedDestinationLocation: number = 0;
  destinationLocationMapImageUrl: string = '';
  selectedDestinationAddress: string = '';

  // 経路に関しての情報
  courseMapImageUrl: string = '';

  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private router: Router,
    private db: AngularFirestore,
    private reservationService: ReservationService,
    public alertController: AlertController,
    public datepipe: DatePipe,
    private yahooService: YahooService
  ) { }

  today = new Date();
  next_year = new Date();
  min_date = "";
  max_date = "";

  ngOnInit() {
    this.min_date = this.datepipe.transform(this.today, "yyyy-MM-dd");
    this.next_year.setFullYear(this.next_year.getFullYear() + 1); 
    this.max_date = this.datepipe.transform(this.next_year, "yyyy-MM-dd");
    // this.departureLocationMapImageUrl = this.yahooService.get_mapimg_url({
    //   lat: 37.508048055556,
    //   lon: 139.932011666667,
    //   z: 17,
    //   width: 300,
    //   height: 200,
    //   // pointer: 'on',
    //   pin1: [37.508048055556, 139.932011666667, '会津若松']
    // });
    // this.yahooService.getLocalInfo({
    //   query: '会津若松駅'
    // });
    this.setCourseMapImageUrl();
  }

  async on_date_changed(){
    if(new Date(this.data.departure_time) < new Date()){
      const alert = await this.alertController.create({
        header:"現在時刻より前を出発時間にはできません",
        buttons:["OK"],
      });
      await alert.present();
    }
  }

  onPost() {
    //if destination or departure name is empty then don't work
    if (!this.data.destination_name || !this.data.departure_name) {
      this.alert_no_information();
      return;
    }
    else if (!this.data.departure_time) {
      this.alert_no_time();
      return;
    }
      // else if(new Date(this.data.departure_time) <= new Date(this.data.departure_time)){
      else if(new Date(this.data.departure_time) <= new Date()){
      this.alert_invalid_time();
      return;
    }

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // case signin
        // const newReservationId = this.db.createId();
        // var newReservationRef = this.db.collection('reservations').doc(newReservationId);

        var reservation: Reservation = new Reservation({
          uid: '',
          // owner: user.uid
          owner: this.db.collection('users').doc(user.uid).ref,
          // departure_name: this.data.departure_name,
          // destination_name: this.data.destination_name,
          departure_name: this.departureLocalInfo.Feature[this.indexOfSelectedDepatureLocation].Name,
          destination_name: this.destinationLocalInfo.Feature[this.indexOfSelectedDestinationLocation].Name,
          departure_point: this.data.departure_point,
          destination_point: this.data.destination_point,
          departure_time: new Date(this.data.departure_time),
          max_passenger_count: this.data.max_passenger_count,
          passenger_count: this.data.passenger_count,
          comment: this.data.comment,
          condition: this.data.condition,
          created_at: new Date(),
          updated_at: new Date()
        });

        console.log(this.data);
        console.log('reservavtion:', reservation);
        // newReservationRef.set(reservation.deserialize());
        this.reservationService.addReservation(reservation).then(() => {
          // this.navCtrl.back();
          // this.navCtrl.navigateBack('/app/tabs/reservations');
          this.dismissModal(true);
          // this.router.navigateByUrl('/app/tabs/reservations');
        });
      } else {
        // case signout
      }
    });
    this.alert_complete_send();
  }

  clamp(x, min, max) {
    x = Math.max(x, min);
    x = Math.min(x, max);
    return x;
  }

  on_click_max_passenger(amount) {
    this.data.max_passenger_count = this.clamp(this.data.max_passenger_count + amount, 2, 100);
    this.data.passenger_count = this.clamp(this.data.passenger_count, 1, this.data.max_passenger_count - 1);
  }

  on_click_passenger(amount) {
    this.data.passenger_count = this.clamp(this.data.passenger_count + amount, 1, this.data.max_passenger_count - 1);
  }

  async alert_no_information() {
    const alert = await this.alertController.create({
      message: 'Please fill departure place and destination',
      buttons: ['OK']
    });
    await alert.present();
  }

  async alert_no_time() {
    const alert = await this.alertController.create({
      message: 'Please fill in departure time',
      buttons: ['OK']
    });
    await alert.present();
  }

  async alert_invalid_time(){
    const alert = await this.alertController.create({
      message: "Please fill valid departure time",
      buttons: ["OK"],
    });
    await alert.present();
  }

  async alert_complete_send() {
    const alert = await this.alertController.create({
      message: 'Complete posting',
      buttons: ['OK']
    });
    await alert.present();
  }

  dismissModal(isUpdate: boolean = false) {
    this.modalCtrl.dismiss({
      "isUpdate": isUpdate
    });
  }

  // getMapImageUrl(coordinate, location_name, z=17, width=300, height=200) {
  getMapImageUrl(localInfo, selectedIndex, z=17, width=300, height=200) {
    var coordinate = localInfo.Feature[selectedIndex].Geometry.Coordinates.split(',');
    return this.yahooService.get_mapimg_url({
      lat: Number(coordinate[1]),
      lon: Number(coordinate[0]),
      z: z,
      width: width,
      height: height,
      // pointer: 'on',
      pin: [Number(coordinate[1]), Number(coordinate[0]), localInfo.Feature[selectedIndex].Name]
      // pin1: [Number(coordinate[1]), Number(coordinate[0]), this.departureLocalInfo.Feature[this.indexOfSelectedDepatureLocation].Name]
    });
  }

  getCourseMapImageUrl(width=300, height=200) {
    // var route = this.data.departure_point.latitude.toString() + ','
    //             + this.data.departure_point.longitude.toString() + ','
    //             + this.data.destination_point.latitude.toString() + ','
    //             + this.data.destination_point.longitude.toString();
    
    var param = {
      // route: route,
      width: width,
      height: height,
    }
    var departure_name = this.departureLocalInfo.Feature[this.indexOfSelectedDepatureLocation].Name;
    var destination_name = this.destinationLocalInfo.Feature[this.indexOfSelectedDestinationLocation].Name;
    this.courseMapImageUrl = this.yahooService.getCourse(this.data.departure_point, this.data.destination_point, param, departure_name, destination_name);
  }

  setCourseMapImageUrl() {
    // 出発地と目的地の位置情報が設定されているか確認
    var empty_geopoint = new firebase.firestore.GeoPoint(0, 0);
    var is_exist_geopoint = (!this.data.departure_point.isEqual(empty_geopoint))
                              && (!this.data.destination_point.isEqual(empty_geopoint));

    if (is_exist_geopoint) { // 設定されている場合
      // YahooAPIを使い経路図の画像URLを取得
      this.getCourseMapImageUrl();

    } else {  // 設定されていない場合 
      // 何もしない
      return;
    }
  }

  ///////////////////////////////////////////////////////////////
  // 入力が変更されるたびにをリアルタイムでサーバーから取得する
  // 入力が変更されるたびに毎回取得するとサーバーとの通信が増えるため
  // setTimeoutで1500ms入力の変更がない場合サーバーと通信する
  ///////////////////////////////////////////////////////////////
  // serverCheck(val: string): void {
  //   // すでにチェック待ちの場合は停止させる。
  //   if (this.checkInterval) {
  //     clearTimeout(this.checkInterval);
  //     this.checkInterval = undefined;
  //   }
  //   // ローカルでできるチェックを行う。
  //   if (!val.match(/^[a-zA-Z]+$/)) {
  //     return;
  //   }
  //
  //   this.checkInterval = setTimeout(() => {
  //     this.checkInterval = undefined;
  //     // サーバーチェックリクエスト処理
  //   }, 1500);
  // }
  ////////////////////////////////////////////////////////////////
  
  inputDeparture(ev) {
    // console.log('ev:', ev);
    this.data.departure_name = ev;
    // すでにチェック待ちの場合は停止させる。
    if (this.checkInputDepartureInterval) {
      clearTimeout(this.checkInputDepartureInterval);
      this.checkInputDepartureInterval = undefined;
    }
    // ローカルでできるチェックを行う。
    // if (!val.match(/^[a-zA-Z]+$/)) {
    //   return;
    // }
    if (!ev) {
      // this.departureLocalInfo = {};
      return;
    }
  
    this.checkInputDepartureInterval = setTimeout(async () => {
      this.checkInputDepartureInterval = undefined;
      // サーバーチェックリクエスト処理
      // 出発地に入力されている名前に関係するロケーションの情報を取得する
      var result = await this.yahooService.getLocalInfo({
        query: this.data.departure_name
      });
      result.subscribe((localInfo) => {
        console.log('localInfo:', localInfo);
        // 位置に関する初期化設定
        this.data.departure_point = new firebase.firestore.GeoPoint(0, 0);
        // 選択されているインデックスを初期化
        this.indexOfSelectedDepatureLocation=0;
        // 出発地のロケーションの候補を設定する
        this.departureLocalInfo = localInfo;
        // 出発地を選択する
        this.selectDepartureLocation()
      });
    }, 1500);

  }

  selectDepartureLocation() {
    if (this.departureLocalInfo.Feature) {
      // 選択されているロケーションの位置座標の取得
      var coordinate = this.departureLocalInfo.Feature[this.indexOfSelectedDepatureLocation].Geometry.Coordinates.split(',');
      // 位置情報を登録
      this.data.departure_point = new firebase.firestore.GeoPoint(Number(coordinate[1]), Number(coordinate[0]));

      // 選択されているロケーションのマップ画像を取得
      this.departureLocationMapImageUrl
        = this.getMapImageUrl(
          this.departureLocalInfo,
          this.indexOfSelectedDepatureLocation
          )
      
      // 選択されているロケーションの住所を取得
      this.selectedDepartureAddress = this.departureLocalInfo.Feature[this.indexOfSelectedDepatureLocation].Property.Address;
      
      // 経路画像のURLを設置する
      this.setCourseMapImageUrl();
    }
  }
  
  inputDestination(ev) {
    // console.log('ev:', ev);
    this.data.destination_name = ev;
    // すでにチェック待ちの場合は停止させる。
    if (this.checkInputDestinationInterval) {
      clearTimeout(this.checkInputDestinationInterval);
      this.checkInputDestinationInterval = undefined;
    }
    // ローカルでできるチェックを行う。
    // if (!val.match(/^[a-zA-Z]+$/)) {
    //   return;
    // }
    if (!ev) {
      // 目的地の入力が空のときは何もしない
      return;
    }
  
    this.checkInputDestinationInterval = setTimeout(async () => {
      this.checkInputDestinationInterval = undefined;
      // サーバーチェックリクエスト処理
      // 目的地に入力されている名前に関係するロケーションの情報を取得する
      var result = await this.yahooService.getLocalInfo({
        query: this.data.destination_name
      });
      result.subscribe((localInfo) => {
        console.log('localInfo:', localInfo);
        // 位置に関する初期化設定
        this.data.destination_point = new firebase.firestore.GeoPoint(0, 0);
        // 選択されているインデックスを初期化
        this.indexOfSelectedDestinationLocation=0;
        // 目的地のロケーションの候補を設定する
        this.destinationLocalInfo = localInfo;
        // 目的地を選択する
        this.selectDestinationLocation()
      });
    }, 1500);

  }

  selectDestinationLocation() {
    if (this.destinationLocalInfo.Feature) {
      // 選択されているロケーションの位置座標の取得
      var coordinate = this.destinationLocalInfo.Feature[this.indexOfSelectedDestinationLocation].Geometry.Coordinates.split(',');
      // 位置情報を登録
      this.data.destination_point = new firebase.firestore.GeoPoint(Number(coordinate[1]), Number(coordinate[0]));
      
      // 選択されているロケーションのマップ画像を取得
      this.destinationLocationMapImageUrl
        = this.getMapImageUrl(
          this.destinationLocalInfo,
          this.indexOfSelectedDestinationLocation
          )
      
      // 選択されているロケーションの住所を取得
      this.selectedDestinationAddress = this.destinationLocalInfo.Feature[this.indexOfSelectedDestinationLocation].Property.Address;
      // 経路画像のURLを設置する
      this.setCourseMapImageUrl();
    }
  }


}
