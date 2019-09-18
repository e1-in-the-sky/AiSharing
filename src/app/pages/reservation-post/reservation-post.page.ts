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
import { LeafletService } from '../../services/leaflet/leaflet.service';

@Component({
  selector: 'reservation-post',
  templateUrl: './reservation-post.page.html',
  styleUrls: ['./reservation-post.page.scss'],
})
export class ReservationPostPage implements OnInit {
  // この画面でユーザーができること  /////////////////
  // 1. 出発地の入力
  //   a. 提案された出発地の選択
  // 2. 目的地の入力
  //   a. 提案された目的地の選択
  // 3. 出発時刻の選択  (ngModelで対応)
  // 4. 最大乗車人数の入力  (ngModelで対応)
  // 5. 現在乗車人数の入力  (ngModelで対応)
  // 6. コメントの入力  (ngModelで対応)
  // 7. 投稿
  /////////////////////////////////////////////////

  // 初期設定  ////////////////////////////////////
  // 1. 投稿データの初期化
  // 2. 地図の初期化
  /////////////////////////////////////////////////

  // 1. 出発地を入力したとき  ///////////////////////
  //   a. 場所の提案
  // (済)提案する場所がないときは、エラーを表示(アラートだと入力のたびに出てきて邪魔)
  // 提案する場所がないときは、手動で出発地を決める（理想）
  /////////////////////////////////////////////////
  
  // 2. 目的地を入力したとき  ///////////////////////
  //   a. 場所の提案
  // (済)提案する場所がないときは、エラーを表示(アラートだと入力のたびに出てきて邪魔)
  // 提案する場所がないときは、手動で目的地を決める(理想)
  //////////////////////////////////////////////////

  // 7. 投稿  //////////////////////////////////////
  //  1. 投稿情報のバリデーション
  //  2. 投稿に必要なデータをまとめる
  //  3. 投稿
  //  4. 投稿詳細などほかの画面に遷移
  //////////////////////////////////////////////////

  // 提案された場所を選んだ時  //////////////////////
  // 地図にマーカーの設置
  // もし、出発地と目的地が両方あるときは、ルートを表示する
  /////////////////////////////////////////////////

  // ルートについて  ///////////////////////////////
  // 初期: 地図上には何も表示しない
  // 片方選択: 地図にマーカーだけ設置
  // 両方選択: 地図にマーカーとルートを設置
  // 
  // 両方が選択されている状態から選択されていない状態になったときは
  // 1. ルートを削除（おそらく同時にマーカーも消される）
  // 2. 選択されているマーカーを設置
  // 片方が選択されている状態から選択されていない状態になったときは
  // 1. マーカーを削除
  //////////////////////////////////////////////////

  data: {
    departure_name: string,
    destination_name: string,
    departure_point: firebase.firestore.GeoPoint,
    destination_point: firebase.firestore.GeoPoint,
    departure_time: string,
    max_passenger_count: number,
    passenger_count: number,

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

  // default_mapimg_option = {
  //   lat: 35.681093831866455,
  //   lon: 139.76716278230535,
  //   z: 17,
  //   width: 300,
  //   height: 200,
  //   pointer: 'on'
  // };
  
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

  totalDistance: number;
  totalTime: number;
  fare: number;

  departureMarker: any;
  destinationMarker: any;

  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private router: Router,
    private db: AngularFirestore,
    private reservationService: ReservationService,
    public alertController: AlertController,
    public datepipe: DatePipe,
    private yahooService: YahooService,
    private leafletService: LeafletService
  ) { }

  today = new Date();
  next_year = new Date();
  min_date = "";
  max_date = "";

  // Y: any; // Yahoo APIのY
  L: any; // Leaflet APIのL
  map: any; // Leaflet APIのmap
  routeControl: any; // Leaflet APIのroute control

  async ngOnInit() {
    this.prepareLeafletMap();
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

    //地図を表示するdiv要素のidを設定
    this.map = this.L.map('course_map');
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
    
    //地理院地図の標準地図タイル
    var gsi = this.L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', 
    {attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"});
    //地理院地図の淡色地図タイル
    var gsipale = this.L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
      {attribution: "<a href='http://portal.cyberjapan.jp/help/termsofuse.html' target='_blank'>地理院タイル</a>"});
    //地理院地図の航空地図タイル
    var gsiphoto = this.L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
      {attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"});
    //オープンストリートマップのタイル
    var osm = this.L.tileLayer('http://tile.openstreetmap.jp/{z}/{x}/{y}.png',
      {  attribution: "<a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors" });
    //baseMapsオブジェクトのプロパティに3つのタイルを設定
    var baseMaps = {
      "地理院地図" : gsi,
      "淡色地図" : gsipale,
      "航空地図" : gsiphoto,
      "オープンストリートマップ"  : osm
    };
    //layersコントロールにbaseMapsオブジェクトを設定して地図に追加
    //コントロール内にプロパティ名が表示される
    this.L.control.layers(baseMaps).addTo(this.map);
    osm.addTo(this.map);
    // gsi.addTo(this.map);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ルート
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // leaflet-routing-machine.js:17932 You are using OSRM's demo server. Please note that it is **NOT SUITABLE FOR PRODUCTION USE**.
    // Refer to the demo server's usage policy: https://github.com/Project-OSRM/osrm-backend/wiki/Api-usage-policy
    //
    // To change, set the serviceUrl option.
    //
    // Please do not report issues with this server to neither Leaflet Routing Machine or OSRM - it's for
    // demo only, and will sometimes not be available, or work in unexpected ways.
    //
    // Please set up your own OSRM server, or use a paid service provider for production.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
  }

  moveDepartureMarker(lat, lon, name: string, openPopup: boolean = true) {
    if (this.departureMarker) {
      this.map.removeLayer(this.departureMarker);
    }
    this.departureMarker = this.L.marker([lat, lon], {title: name});
    this.departureMarker.addTo(this.map);

    if (name) {
      // this.departureMarker.bindTooltip(name);
      if (openPopup) {
        this.departureMarker.bindPopup(name).openPopup();
      } else {
        this.departureMarker.bindPopup(name);
      }
    }

    //地図の中心とズームレベルを指定
    this.map.setView([lat, lon], 11);
  }

  moveDestinationMarker(lat, lon, name: string, openPopup: boolean = true) {
    if (this.destinationMarker) {
      this.map.removeLayer(this.destinationMarker);
    }
    this.destinationMarker = this.L.marker([lat, lon], {title: name});
    this.destinationMarker.addTo(this.map);

    if (name) {
      // this.destinationMarker.bindTooltip(name);
      if (openPopup) {
        this.destinationMarker.bindPopup(name).openPopup();
      } else {
        this.destinationMarker.bindPopup(name);
      }
    }

    //地図の中心とズームレベルを指定
    this.map.setView([lat, lon], 11);
  }

  // distance の単位はメートル
  getFare(distance) {
    return 510 + 90 * Math.floor((distance < 1000 ? 0 : distance - 1000) / 282);
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
          total_distance: this.totalDistance,  // 移動距離(m)
          total_time: this.totalTime,  // 移動時間(s)
          fare: this.fare,  // 運賃(円)
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

  async alert_invalid_time(){
    const alert = await this.alertController.create({
      message: "適切な出発時刻を入力してください",
      buttons: ["OK"],
    });
    await alert.present();
  }

  async alert_complete_send() {
    const alert = await this.alertController.create({
      message: '投稿が完了しました',
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

      // 選択されているロケーションに出発地のピンを移動する(LeafletAPI)
      // this.moveDepartureMarker(Number(coordinate[1]), Number(coordinate[0]), this.departureLocalInfo.Feature[this.indexOfSelectedDepatureLocation].Name, true);

      // 経路(LeafletAPI)
      var container = this.L.DomUtil.create('div');
      var latlng = new this.L.LatLng( coordinate[1], coordinate[0] );
      this.L.popup()
        .setContent(container)
        .setLatLng(latlng)
        .openOn(this.map);
      this.routeControl.spliceWaypoints(0, 1, latlng);
      this.map.closePopup();
      console.log('total distance:', this.totalDistance);
      console.log('total time:', this.totalTime);
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

      // 選択されているロケーションに目的地のピンを移動する(LeafletAPI)
      // this.moveDestinationMarker(Number(coordinate[1]), Number(coordinate[0]), this.destinationLocalInfo.Feature[this.indexOfSelectedDestinationLocation].Name, true);

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


}
