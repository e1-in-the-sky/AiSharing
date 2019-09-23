import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import * as firebase from 'firebase';


import { Reservation } from '../../models/reservation';
import { AngularFirestore } from '@angular/fire/firestore';
import { ReservationService } from '../../services/reservation/reservation.service';
import { NavController, ModalController, LoadingController, NavParams } from '@ionic/angular';
import { Router, NavigationExtras } from '@angular/router';
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
    // private navParams: NavParams,
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

  leafletIsAlredyPrepared: boolean = false;


  route_search_url = "https://us-central1-aisharing-ac6cc.cloudfunctions.net/routeSearch3"

  ngOnInit() {
    this.min_date = this.datepipe.transform(this.today, "yyyy-MM-dd");
    this.next_year.setFullYear(this.next_year.getFullYear() + 1); 
    this.max_date = this.datepipe.transform(this.next_year, "yyyy-MM-dd");
  }

  async ionViewWillEnter() {
    if (!this.leafletIsAlredyPrepared) {
      await this.prepareLeafletMap();
    }
  }

  async prepareLeafletMap() {
    const win = window as any;
    if (!win.L) {
      console.log("win.Lが存在しません");
      // this.L = await this.leafletService.getLeafletMaps();
      this.L = await this.leafletService.includeAllLeaflet();
    } else {
      console.log("win.Lが存在します");
      this.L = win.L;
    }

    // new
    //地理院地図の標準地図タイル
    var gsi = this.L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', 
    {attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"});
    //地理院地図の淡色地図タイル
    var gsipale = this.L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
      {attribution: "<a href='https://portal.cyberjapan.jp/help/termsofuse.html' target='_blank'>地理院タイル</a>"});
    //地理院地図の航空地図タイル
    var gsiphoto = this.L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
      {attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"});
    //オープンストリートマップのタイル
    var osm = this.L.tileLayer('https://tile.openstreetmap.jp/{z}/{x}/{y}.png',
      {  attribution: "<a href='https://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors" });
    //baseMapsオブジェクトのプロパティに3つのタイルを設定
    var baseMaps = {
      "オープンストリートマップ"  : osm,
      "地理院地図" : gsi,
      "淡色地図" : gsipale,
      "航空地図" : gsiphoto
    };
    //layersコントロールにbaseMapsオブジェクトを設定して地図に追加
    //コントロール内にプロパティ名が表示される
    // this.L.control.layers(baseMaps).addTo(this.map);
    // osm.addTo(this.map);
    // gsi.addTo(this.map);
    

    //地図を表示するdiv要素のidを設定
    this.map = this.L.map('route_search_map', {
      contextmenu: true,
      contextmenuWidth: 140,
	      contextmenuItems: [{
		      text: 'ここを出発地にする',
		      callback: this.setDepartureInContextMenu
        },
        {
          text: 'ここを目的地にする',
          callback: this.setDestinationInContextMenu
        }
      ]
    });
    this.L.control.layers(baseMaps).addTo(this.map);
    osm.addTo(this.map);
    //地図の中心とズームレベルを指定
    this.map.setView([37.52378812, 139.938139], 11);  // 東京駅 35.681236 139.767125  会津大学: 37.52378812, 139.938139
    //表示するタイルレイヤのURLとAttributionコントロールの記述を設定して、地図に追加する
    // L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
    //     attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
    // }).addTo(map);

    //スケールコントロールを最大幅200px、右下、m単位で地図に追加
    this.L.control.scale({ maxWidth: 100, position: 'bottomright', imperial: false }).addTo(this.map);

    // ピンの追加
    // this.moveDepartureMarker(35.40, 136, "ここはどこ？", true);

    var routing = await this.leafletService.getLeafletRouting();
    this.routeControl = routing.control({
      waypoints: [
        null
        // this.L.latLng(37.506801, 139.930428),   // 37.506801 139.930428
        // this.L.latLng(37.47972, 139.96083)   // 東山温泉 37.47972 139.96083
      ],
      createMarker: (i, waypoints, n) => {
        return win.L.marker(waypoints.latLng, {draggable: false})},
      router: win.L.Routing.graphHopper('0dc4f299-a491-452f-97e0-515c296c9453')  // graph hopperを使っている
    }).addTo(this.map);

    this.routeControl.hide();
 
    this.routeControl.on('routesfound', (e) => {
      // If you're interested in every time the user selects a route, the routeselected event is more approriate.
      // console.log('e:', e);
      // console.log('e.routes:', e.routes);
      this.totalDistance = e.routes[0].summary.totalDistance;
      this.totalTime = e.routes[0].summary.totalTime;
      this.fare = this.getFare(this.totalDistance);
      console.log('Total Distance (unit: m):', this.totalDistance);
      console.log('Total Time (unit: s):', this.totalTime);
      console.log('Fare:', this.fare);
      // var routes = e.routes;
    });

    // add new waypoints
    // L.routing.control.setWaypoints([
    //   L.latLng(lat1, lon1),
    //   L.latLng(lat2, lon2)
    // ]);

    // var totalDistance = routeControl._routes[0].summary.totalDistance;
    // var totalTime = routeControl._routes[0].summary.totalTime;
    console.log('routeControl:', this.routeControl);
    console.log('routeControl.e:', this.routeControl.e);
    console.log('routeControl.routes:', this.routeControl.routes);
    // console.log('Total Distance (unit: m):', totalDistance);
    // console.log('Total Time (unit: s):', totalTime);
    // this.L.Routing.control({
    //   waypoints: [
    //     this.L.latLng(57.74, 11.94),
    //     this.L.latLng(57.6792, 11.949)
    //   ]
    // }).addTo(this.map);

    // map長押しの処理
    // this.map.on('contextmenu', function(e){  // (e) => {} も function(e){}も座標が変わらない
    //   console.log('MouseEvent (contextmenu):', e);
    //   console.log('e.latlng:', e.latlng);
    // });

    this.leafletIsAlredyPrepared = true;
  }

  setDepartureInContextMenu = async (e) => {
    var result = await this.yahooService.getAddress({
      lat: e.latlng.lat,
      lon: e.latlng.lng
    });

    result.subscribe((geocode) => {
      // 入力文字を空にする
      this.data.departure_name = "";
      // 位置に関する初期化設定
      this.data.departure_point = new firebase.firestore.GeoPoint(0, 0);
      // 選択されているインデックスを初期化
      this.indexOfSelectedDepatureLocation=0;

      var geoInfo = geocode as any;
      console.log('geocode:', geocode);
      var address = geoInfo.Feature[0].Property.Address;

      // 出発地のロケーションの候補を設定する
      this.departureLocalInfo = {
        Feature: [
          {
            Name: address,
            Property: {
              Address: address
            },
            Geometry: {
              Coordinates: e.latlng.lng.toString() + ',' + e.latlng.lat.toString()
            }
          }
        ]
      };
      console.log('this.departureLocalInfo:', this.departureLocalInfo);
      // 出発地を選択する
      this.selectDepartureLocation()
    });
  }

  setDestinationInContextMenu = async (e) => {
    var result = await this.yahooService.getAddress({
      lat: e.latlng.lat,
      lon: e.latlng.lng
    });

    result.subscribe((geocode) => {
      // 入力文字を空にする
      this.data.destination_name = "";
      // 位置に関する初期化設定
      this.data.destination_point = new firebase.firestore.GeoPoint(0, 0);
      // 選択されているインデックスを初期化
      this.indexOfSelectedDestinationLocation=0;

      var geoInfo = geocode as any;
      console.log('geocode:', geocode);
      var address = geoInfo.Feature[0].Property.Address;

      // 目的地のロケーションの候補を設定する
      this.destinationLocalInfo = {
        Feature: [
          {
            Name: address,
            Property: {
              Address: address
            },
            Geometry: {
              Coordinates: e.latlng.lng.toString() + ',' + e.latlng.lat.toString()
            }
          }
        ]
      };
      // 目的地を選択する
      this.selectDestinationLocation()
    });
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
      // 経路(LeafletAPI)
      var container = this.L.DomUtil.create('div');
      var latlng = new this.L.LatLng( coordinate[1], coordinate[0] );
      this.L.popup()
        .setContent(container)
        .setLatLng(latlng)
        .openOn(this.map);
      this.routeControl.spliceWaypoints(0, 1, latlng);
      this.map.closePopup();
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
      // 経路(LeafletAPI)
      var container = this.L.DomUtil.create('div');
      var latlng = new this.L.LatLng( coordinate[1], coordinate[0] );
      this.L.popup()
        .setContent(container)
        .setLatLng(latlng)
        .openOn(this.map);
      this.routeControl.spliceWaypoints(this.routeControl.getWaypoints().length - 1, 1, latlng);
      this.map.closePopup();
    }
  }

  

  async onSearch(){

    // バリデーション
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

    // this.getRouteが失敗した時の処理
    try {
      var routes = await this.getRoute(param);
      console.log(routes);
      if (routes.responses.length === 0) {
        loading.dismiss();
        var error = await this.createError('', "最適な投稿を見つけることができませんでした")
        error.present();
        return;
      }
      loading.dismiss();
    } catch (err) {
      loading.dismiss();
      var error = await this.createError("エラー", err.toString());
      error.present();
      return;
    }
    
    // this.navCtrl.navigateForward('', {routes: routes})
    let navigationExtras: NavigationExtras = {
      state: {
        routes: routes
      }
    };
    this.router.navigate(['/app/tabs/route-search/list'], navigationExtras);

    // const modal = await this.modalCtrl.create({
    //   component: RouteSearchListPage,
    //   componentProps: {routes: routes},
    // });

    // await modal.present();
    // const { data } = await modal.onWillDismiss();
  }

  // async sample() {
  //   var param = {
  //     route: "37.521469,139.940061,37.395645,139.932622",
  //     departure_time: "2019-09-25T10:40:00"
  //   }
  //   var res = await this.getRoute(param);
  //   console.log('res:', res);
  // }

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

  async createError(header = 'エラー', message = '') {
    let alert = await this.alertController.create({
      header: header,
      // subHeader: 'Subtitle',
      message: message,
      buttons: ['OK']
    });
    return alert;
  }

}
