import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import * as firebase from 'firebase';


import { Reservation } from '../../models/reservation';
import { AngularFirestore } from '@angular/fire/firestore';
import { ReservationService } from '../../services/reservation/reservation.service';
import { NavController, ModalController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Title } from '@angular/platform-browser';
import { DatePipe } from '@angular/common'
import { YahooService } from '../../services/yahoo/yahoo.service';
import { LeafletService } from '../../services/leaflet/leaflet.service';
import { RouteSearchListPage } from'../route-search-list/route-search-list.page';

@Component({
  selector: 'route-search',
  templateUrl: './route-search.page.html',
  styleUrls: ['./route-search.page.scss'],
})
export class RouteSearchPage implements OnInit {

  data: {
    departure_name: string,
    destination_name: string,
    departure_point: firebase.firestore.GeoPoint,
    destination_point: firebase.firestore.GeoPoint,
    departure_time: string,
    max_passenger_count: number,
    passenger_count: number,
    onlywoman: boolean,
    bigluggage: boolean,

    total_distance: number,
    total_time: number,
    fare: number,

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
      onlywoman: false,
      bigluggage: false, 

      total_distance: 0,  // 移動距離(m)
      total_time: 0,  // 移動時間(s)
      fare: 0,  // 運賃(円)

      comment: 'よろしくお願いします。',
      condition: '募集中',
      created_at: new Date(),
      updated_at: new Date()
    };

  isLoadingDeparuteLocalInfo: boolean = false;
  isLoadingDestinationLocalInfo: boolean = false;

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

  totalDistance: number;
  totalTime: number;
  fare: number;

  departureMarker: any;
  destinationMarker: any;

  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private router: Router,
    private db: AngularFirestore,
    private reservationService: ReservationService,
    public alertController: AlertController,
    public datepipe: DatePipe,
    private yahooService: YahooService,
    private leafletService: LeafletService,
    private http: HttpClient
  ) { }

  today = new Date();
  next_year = new Date();
  min_date = "";
  max_date = "";

  max_transfer_time = 3;
  stayable_time = 30;
  walkable_distance = 1000;

  // Y: any; // Yahoo APIのY
  L: any; // Leaflet APIのL
  map: any; // Leaflet APIのmap
  routeControl: any; // Leaflet APIのroute control


  route_search_url = "https://us-central1-aisharing-ac6cc.cloudfunctions.net/routeSearch3"

  ngOnInit() {
    this.sample();
    // Yahoo javascript api  ////////////////////////////////////////////////////////////
    // const Y = await this.yahooService.getYahooMaps();
    // console.log('Y:', Y);
    // var ymap = new Y.Map("yahoomap");
    // console.log('ymap:', ymap);
    // console.log('Y.LayerSetId.NORMAL:', Y.LayerSetId.NORMAL);
    // // ymap.drawMap(new Y.LatLng(35.66572, 139.73100), 17, Y.LayerSetId.NORMAL);
    // ymap.drawMap(new Y.LatLng(35.66572, 139.73100));
    //////////////////////////////////////////////////////////////////////////////////////

    // Yahoo javascript api 2019/09/14 ///////////////////////////////////////////////////
    // this.yahooService.getYahooMaps().then( Y => {
    //   console.log('Y:', Y);
    //   var ymap = new Y.Map("yahoomap");
    //   console.log('ymap:', ymap);
    //   console.log('Y.LayerSetId.NORMAL:', Y.LayerSetId.NORMAL);
    //   // ymap.drawMap(new Y.LatLng(35.66572, 139.73100), 17, Y.LayerSetId.NORMAL);
    //   ymap.drawMap(new Y.LatLng(35.66572, 139.73100));  
    // });
    //////////////////////////////////////////////////////////////////////////////////////

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
  }

  // distance の単位はメートル
  getFare(distance) {
    return 510 + 90 * Math.floor((distance < 1000 ? 0 : distance - 1000) / 282);
  }

  clamp(x, min, max) {
    x = Math.max(x, min);
    x = Math.min(x, max);
    return x;
  }

  async alert_no_information() {
    const alert = await this.alertController.create({
      message: '出発地と目的地を入力してください',
      buttons: ['OK']
    });
    await alert.present();
  }

  async alert_no_time() {
    const alert = await this.alertController.create({
      message: '出発時刻を入力してください',
      buttons: ['OK']
    });
    await alert.present();
  }

  dismissModal(isUpdate: boolean = false) {
    this.modalCtrl.dismiss({
      "isUpdate": isUpdate
    });
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
      this.isLoadingDeparuteLocalInfo = false;
      return;
    }
  
    this.isLoadingDeparuteLocalInfo = true;
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
      this.isLoadingDeparuteLocalInfo = false;
    }, 1500);

  }

  selectDepartureLocation() {
    if (this.departureLocalInfo.Feature) {
      // 選択されているロケーションの位置座標の取得
      var coordinate = this.departureLocalInfo.Feature[this.indexOfSelectedDepatureLocation].Geometry.Coordinates.split(',');
      // 位置情報を登録
      this.data.departure_point = new firebase.firestore.GeoPoint(Number(coordinate[1]), Number(coordinate[0]));
      // 選択されているロケーションの住所を取得
      this.selectedDepartureAddress = this.departureLocalInfo.Feature[this.indexOfSelectedDepatureLocation].Property.Address;
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
    this.isLoadingDestinationLocalInfo = false;
    return;
    }
  
    this.isLoadingDestinationLocalInfo = true;
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
      this.isLoadingDestinationLocalInfo = false;
    }, 1500);

  }

  selectDestinationLocation() {
    if (this.destinationLocalInfo.Feature) {
      // 選択されているロケーションの位置座標の取得
      var coordinate = this.destinationLocalInfo.Feature[this.indexOfSelectedDestinationLocation].Geometry.Coordinates.split(',');
      // 位置情報を登録
      this.data.destination_point = new firebase.firestore.GeoPoint(Number(coordinate[1]), Number(coordinate[0]));
      // 選択されているロケーションの住所を取得
      this.selectedDestinationAddress = this.destinationLocalInfo.Feature[this.indexOfSelectedDestinationLocation].Property.Address;
    }
  }

  

  async onSearch(){

    if(this.data.destination_name == null || this.data.departure_name == null || this.walkable_distance == null
      || this.stayable_time == null || this.max_transfer_time == null)return;

    let loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: '経路を検索中...'
    });
    loading.present();
    var route = this.data.departure_point.latitude.toString()   + ",";
    route    += this.data.departure_point.longitude.toString()  + ",";
    route    += this.data.destination_point.latitude.toString() + ",";
    route    += this.data.destination_point.longitude.toString();

    var hoge = new Date(this.data.departure_time);
    hoge.setHours(hoge.getHours()+9);

    var param = {
      route: route,
      valid_distance: this.walkable_distance,
      valid_time: this.stayable_time,
      max_count: this.max_transfer_time,
      departure_time: hoge 
    }

    console.log(param);

    var routes = await this.getRoute(param);
    console.log(routes);

    loading.dismiss();
    

    const modal = await this.modalCtrl.create({
      component: RouteSearchListPage,
      componentProps: {routes: routes},
    });

    await modal.present();
  }


  async sample() {
    var param = {
      route: "37.521469,139.940061,37.395645,139.932622",
      departure_time: "2019-09-25T10:40:00"
    }
    var res = await this.getRoute(param);
    console.log('res:', res);
  }

  async getRoute(param): Promise<any> {
    // https://us-central1-aisharing-ac6cc.cloudfunctions.net/routeSearch3?route=37.521469,139.940061,37.395645,139.932622&departure_time=2019-09-25T10:40:00
    if (!param.route) {
      throw Error("routeが必要");
    }

    var query = new URLSearchParams(param).toString();

    return new Promise((resolve, reject) => {
      this.http.get(this.route_search_url + '?' + query)
      .subscribe((res) => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }

}
