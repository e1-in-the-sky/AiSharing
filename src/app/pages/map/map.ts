import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { ConferenceData } from '../../providers/conference-data';
import { Platform, LoadingController, NavController, ModalController, AlertController, ToastController } from '@ionic/angular';
import { LeafletService } from '../../services/leaflet/leaflet.service';
import { ReservationService } from '../../services/reservation/reservation.service';
import { Reservation } from '../../models/reservation';
import { MapFilterPage } from '../map-filter/map-filter.page';

import * as firebase from 'firebase';
import { MapReservationsPage } from '../map-reservations/map-reservations.page';

@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
  styleUrls: ['./map.scss']
})
export class MapPage implements OnInit{
  @ViewChild('mapCanvas') mapElement: ElementRef;

  slideOpts = {
    initialSlide: 1,
    speed: 400
  };

  leafletIsAlredyPrepared = false;

  L: any;
  map: any;
  markerClusterGroup: any;
  reservations: Reservation[] = [];
  reservationMarkers: any;

  zoom: number;
  posCenter: any;
  posNW: any;
  posSE: any;

  departureIcon: any;
  destinationIcon: any;

  selectedReservation: Reservation;

  currentPositionMarker: any;

  currentPosition = {
    // 東京駅
    lat: 35.681236,
    lng: 139.767125
  };

  routeControl: any;

  today = new Date();
  displayDate: Date = this.today;

  reservationCardAnim = "slideIn";

  filter = {
    departure_name: '',
    destination_name: '',
    departure_time_start: this.today, // 現在
    departure_time_end: new Date(this.today.getFullYear(), this.today.getMonth()+1, this.today.getDate(), this.today.getHours(), this.today.getMinutes()), // 一か月後
    condition: '募集中',
    sort: '出発予定時刻が早い順',
    passenger_capacity: 1
  };

  watchPositionId;

  constructor(
    public confData: ConferenceData,
    public platform: Platform,
    private alertCtrl: AlertController,
    private navController: NavController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private modalController: ModalController,
    private reservationService: ReservationService,
    private leafletService: LeafletService
  ) {}

//   async ngAfterViewInit() {
//     const googleMaps = await getGoogleMaps(
//       'AIzaSyB8pf6ZdFQj5qw7rc_HSGrhUwQKfIe9ICw'
//     );
//     this.confData.getMap().subscribe((mapData: any) => {
//       const mapEle = this.mapElement.nativeElement;

//       const map = new googleMaps.Map(mapEle, {
//         center: mapData.find((d: any) => d.center),
//         zoom: 16
//       });

//       mapData.forEach((markerData: any) => {
//         const infoWindow = new googleMaps.InfoWindow({
//           content: `<h5>${markerData.name}</h5>`
//         });

//         const marker = new googleMaps.Marker({
//           position: markerData,
//           map,
//           title: markerData.name
//         });

//         marker.addListener('click', () => {
//           infoWindow.open(map, marker);
//         });
//       });

//       googleMaps.event.addListenerOnce(map, 'idle', () => {
//         mapEle.classList.add('show-map');
//       });
//     });
//   }
// }

// function getGoogleMaps(apiKey: string): Promise<any> {
//   const win = window as any;
//   const googleModule = win.google;
//   if (googleModule && googleModule.maps) {
//     return Promise.resolve(googleModule.maps);
//   }

//   return new Promise((resolve, reject) => {
//     const script = document.createElement('script');
//     script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=3.31`;
//     script.async = true;
//     script.defer = true;
//     document.body.appendChild(script);
//     script.onload = () => {
//       const googleModule2 = win.google;
//       if (googleModule2 && googleModule2.maps) {
//         resolve(googleModule2.maps);
//       } else {
//         reject('google maps not available');
//       }
//     };
//   });

  // マップのページに入ったときの処理
  // ローディングコントローラーを設置
  // 1. 現在地を取得する
  // 2. 現在地を取得できなかった場合は、現在地を設定する
  // 3. 投稿一覧を取得する
  // (投稿がある場合)
  // 4. 投稿一覧を近い順に並び替えする
  // (5. 近い順から指定の距離までに投稿をフィルタリングする)
  // 6. 投稿の出発地と目的地にマーカーを設置する
  // 7. 投稿をマップの下にスライド表示する

  // 投稿がないとき
  // 投稿がありませんの表示

  // 中心が移動したときの処理
  // (投稿一覧を取得する)
  // (マーカーを削除する)
  // 1. 投稿を近い順に並び替えする
  // (2. 近い順から指定の距離までに投稿をフィルタリングする)
  // 3. 投稿の出発地と目的地にマーカーを設置する(マーカーを削除していない場合は必要なし)
  // 4. 投稿をマップの下にスライド表示する

  // マーカーを選択した時の処理
  // 1. スライドを選択したマーカーの投稿にする
  
  // スライドを選択した時の処理
  // 1. スライドのマーカーに移動する(出発地と目的地があるからどっちかにする)

  // 追加でほしいもの
  // ・(済)ローディングコントローラー
  // ・(済)選択されている投稿を表示する+アニメーションをつける
  // ・(済)現在地に移動するボタン
  // ・(済)現在地から近い順に投稿のリストを表示するボタン

  // async ngAfterViewInit() {
  async ngOnInit() {
  }

  async ionViewWillEnter() {
    console.log('start ionViewWillEnter');
    // ローディングコントローラー
    var loading = await this.createLoading();
    loading.present()

    try {
      // タイムアウトの設定
      // setTimeout(() => { throw new Error('Time Out')}, 1000);  // not working

      // 現在地の取得
      var position = await this.getCurrentPosition();
      this.currentPosition.lat = position.coords.latitude;
      this.currentPosition.lng = position.coords.longitude;
    } catch (error) {
      // if (error.toString() == '[object PositionError]') {
      //   console.log('position error:', error.message);  
      // }
      // const toast = await this.toastCtrl.create({
      //   message: '現在地が取得できません',
      //   showCloseButton: true,
      //   position: 'bottom',
      //   closeButtonText: `Close`
      // });

      // await toast.present();
    }

    try {
      // leaflet Mapの初期設定
      if (!this.leafletIsAlredyPrepared) {
        await this.initLeafletMap();
      }

      // 投稿の読み込み
      this.reservations = await this.reservationService.getReservations();
      // 投稿のフィルタリング
      await this.applyFilterToReservations();

      // マーカーのセット
      this.setMarkers();  // 投稿の出発地と目的地のマーカー
      this.setCurrentPositionMarker();  // 現在地のマーカー

      // ローディングコントローラーの削除
      loading.dismiss();

    } catch (error) {
      loading.dismiss();
      console.log('catch error:', error);
      var errAlert = await this.createError(error);
      errAlert.present();
    }

    this.getWatchCurrentPosition();
    // this.map.setView([this.currentPosition.lat, this.currentPosition.lng], 12);

    console.log('end ionViewWillEnter');
  }

  ionViewDidLeave() {
    // enable the root left menu when leaving the page
    console.log('ionViewDidLeave');
    navigator.geolocation.clearWatch(this.watchPositionId);
    // this.menu.enable(true);
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

  setDisplayDate(e) {
    // console.log(e);
    this.displayDate = new Date(e);
  }

  async setCurrentPositionMarker() {
    var currentPositionIcon = await this.leafletService.getCurrentPositionIcon()
    if (this.currentPositionMarker) {
      this.map.removeLayer(this.currentPositionMarker);
    }
    this.currentPositionMarker = this.L.marker([this.currentPosition.lat, this.currentPosition.lng], {title: "Current Position", icon: currentPositionIcon});
    this.currentPositionMarker.addTo(this.map);
  }

  async getCurrentPosition(): Promise<Position> {
    return new Promise((resolve, reject) => {
      setTimeout(() => reject('geolocation time out'), 30000);
      if (navigator.geolocation) {
        console.log('Geolocation API is enable.');
        navigator.geolocation.getCurrentPosition(position => {
          resolve(position);
        }, (error) => {
          reject(error);
        });
      } else {
        reject('Geolocation API is disable.');
        console.log('Geolocation API is disable.');
      }
    });
  }

  async getWatchCurrentPosition() {
    var onChangePosition = (position) => {
      // console.log('change position:', position);
      this.currentPosition.lat = position.coords.latitude;
      this.currentPosition.lng = position.coords.longitude;
      this.setCurrentPositionMarker();  // 現在地のマーカー
    };
    var errorChangePosition = async (error) => {
      const toast = await this.toastCtrl.create({
        message: '現在地が取得できません',
        showCloseButton: true,
        position: 'bottom',
        closeButtonText: `Close`
      });

      await toast.present();
    }
    this.watchPositionId = navigator.geolocation.watchPosition(onChangePosition, errorChangePosition);
  }

  // async includeLeaflet() {
  //   console.log('start include leaflet');
  //   this.L = await this.leafletService.includeAllLeaflet();
  //   console.log('end include leaflet');
  // }

  async initLeafletMap() {
    console.log('start initLeafletMap');
    this.leafletIsAlredyPrepared = true;
    // this.L = await this.leafletService.getLeafletMaps();
    // await this.includeLeaflet();
    this.L = await this.leafletService.includeAllLeaflet();
    console.log('after leaflet include');
    //地図を表示するdiv要素のidを設定
    this.map = this.L.map('map');
    //地図の中心とズームレベルを指定
    this.map.setView([this.currentPosition.lat, this.currentPosition.lng], 12);  // 東京駅 35.681236 139.767125
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
    var gsipale = this.L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
      {attribution: "<a href='https://portal.cyberjapan.jp/help/termsofuse.html' target='_blank'>地理院タイル</a>"});
    //地理院地図の航空地図タイル
    var gsiphoto = this.L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
      {attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"});
    //オープンストリートマップのタイル
    var osm = this.L.tileLayer('https://tile.openstreetmap.jp/{z}/{x}/{y}.png',
      {  attribution: "<a href='https://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors" });
    //baseMapsオブジェクトのプロパティに4つのタイルを設定
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

    // this.markerClusterGroup = await this.leafletService.getLeafletMarkerCluster();
    // console.log('markerClusterGroup:', this.markerClusterGroup);
    // this.reservationMarkers = this.markerClusterGroup();
    // console.log('reservationMarkers:', this.reservationMarkers);

    this.reservationMarkers = new this.L.markerClusterGroup();

    this.getMapPosition();
    // this.setMarkers();

    // マップが動いた時の処理
    this.map.on('moveend', (e) => this.mapOnMoveEnd(e));

    this.departureIcon = await this.leafletService.getDepartureIcon();
    this.destinationIcon = await this.leafletService.getDestinationIcon();
    // 投稿リストを表示するボタン
    var reservationListButton = this.createReservationListButton();
    reservationListButton.addTo(this.map);

    // 現在地ボタン
    var currentPositionButton = this.createCurrentPositionButton();
    currentPositionButton.addTo(this.map);
    
    console.log('end initLeafletMap');
  }

  // マップが動いた時の処理
  mapOnMoveEnd(e) {
    this.getMapPosition();
  }

  createCurrentPositionButton() {
    // http://pluspng.com/img-png/you-are-here-png-hd-you-are-here-icon-512.png
    // https://pictogram-free.com/highresolution/001-free-pictogram.png
    // <ion-icon name="arrow-round-back">
    return this.L.easyButton('<ion-icon name="locate" style="width: 18px; height: 18px; padding-bottom: 3px; display: inline-flex; vertical-align: middle;">', (btn, map) => {
    // return this.L.easyButton('<img src="https://pictogram-free.com/highresolution/001-free-pictogram.png">', (btn, map) => {
      // map.panTo(homelatlng);
      console.log('move to current position');
      map.panTo([this.currentPosition.lat, this.currentPosition.lng]);
    })
  }

  createReservationListButton() {
    // リスト画像サンプルURL
    // https://cdn.icon-icons.com/icons2/1244/PNG/512/1492790974-93list_84195.png
    // http://freeiconbox.com/icon/256/3930.png
    return this.L.easyButton('<ion-icon name="document" style="width: 18px; height: 18px; padding-bottom: 3px; display: inline-flex; vertical-align: middle;">', (btn, map) => {
    // return this.L.easyButton('<img src="http://freeiconbox.com/icon/256/3930.png">', (btn, map) => {
      // map.panTo(homelatlng);
      console.log('diplay reservations');
      this.createReservationListModal();
      // map.panTo([this.currentPosition.lat, this.currentPosition.lng]);
    })
  }

  async createReservationListModal() {
    console.log('create reservation List modal');

    const modal = await this.modalController.create({
      component: MapReservationsPage,
      componentProps: {
        'reservations': this.reservations,
        'center': this.posCenter
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      // this.filter = data.filter;
      // this.reservations = await this.reservationService.getReservations();
      // await this.applyFilterToReservations();
      // this.setMarkers();
      // this.getReservationsAndFilterWithLoading();
    }
  }

  async createReservationFilterModal() {
    console.log('create reservation filter modal');

    const modal = await this.modalController.create({
      component: MapFilterPage,
      componentProps: {
        'filter': this.filter
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.selectedReservation = null;
      this.filter = data.filter;
      this.reservations = await this.reservationService.getReservations();
      await this.applyFilterToReservations();
      this.setMarkers();
      // this.getReservationsAndFilterWithLoading();
    }
  }

  // マップの位置情報を取得する
  getMapPosition() {
    // 中心座標の緯度経度を取得
    this.posCenter = this.map.getCenter();
    // console.log('center:', this.posCenter);
    // ズーム値を取得
    this.zoom = this.map.getZoom();
    // console.log('zoom:', this.zoom);
    // 表示されているマップの角座標の取得
    var bounds = this.map.getBounds();
    this.posNW = bounds.getNorthWest();　//北端と西端の座標を取得
    this.posSE = bounds.getSouthEast();　//南端と東端なら
    // console.log('posNW:', this.posNW);
    // console.log('posSE:', this.posSE);
  }

  // 投稿一覧のマーカーを設置する
  async setMarkers() {
    console.log('reservations in setMarkers:', this.reservations);
    var async = require('async');
    
    // this.reservationMarkers = [];
    // console.log(this.L.markerClusterGroup);
    // console.log('this.reservationMarkers:', this.reservationMarkers);
    if (this.reservationMarkers) {
      // すでにmarker cluster groupが存在していれば削除する
      this.map.removeLayer(this.reservationMarkers);
    }
    this.reservationMarkers = new this.L.markerClusterGroup();
    // var displayReservations = this.reservations.filter(reservation => this.isReservationInDisplayMap(reservation));
    // var displayReservations = this.reservations;
    // console.log('displayReservations:', displayReservations)
    // displayReservations.forEach(reservation => this.setReservationMarker(reservation));
    // console.log('this.reservations:', this.reservations);
    // await this.reservations.forEach(async reservation => {
    //   console.log('reservation in foreach:', reservation);  // エラーが起きていても入っている
    //   await this.setReservationMarker(reservation);
    // });

    async.each(this.reservations, (reservation, callback) => {
      // console.log('callback:', callback);
      this.setReservationMarker(reservation);
    });
    
    // async.each(this.reservations)
    
    // console.log('this.reservationMarkers:', this.reservationMarkers);
    // console.log('this.reservationMarkers._featureGroup:', this.reservationMarkers._featureGroup);
    // console.log('this.reservationMarkers._featureGroup._layers:', this.reservationMarkers._featureGroup._layers);

    // this.reservationMarksers._featureGroup._layersがないとき
    // core.js:15723 ERROR Error: Uncaught (in promise): TypeError: Cannot read property 'lat' of undefined
    // のエラーが発生する
    this.map.addLayer(this.reservationMarkers);
  }

  async setReservationMarker(reservation: Reservation) {    
    // 出発地のマーカー
    var departureMarker = this.L.marker([reservation.departure_point.latitude, reservation.departure_point.longitude], {title: reservation.uid, icon: this.departureIcon});
    departureMarker.on('click', (e) => this.onClickMarker(e));
    departureMarker.bindPopup(reservation.departure_name);
    
    // 目的地のマーカー
    var destinationMarker = this.L.marker([reservation.destination_point.latitude, reservation.destination_point.longitude], {title: reservation.uid, icon: this.destinationIcon});
    destinationMarker.on('click', (e) => this.onClickMarker(e));
    destinationMarker.bindPopup(reservation.destination_name);

    await this.reservationMarkers.addLayer(departureMarker);
    await this.reservationMarkers.addLayer(destinationMarker);
  }


  // マーカーがクリックされた時の処理
  async onClickMarker(e){
    // console.log('e:', e);
    // console.log('e.target.options.title:', e.target.options.title);
    if (this.selectedReservation) {  // すでに選択した投稿がある場合
      this.slideOutReservationCard();
      setTimeout(async () => {
        this.selectedReservation = await this.reservationService.getReservation(e.target.options.title);
        this.slideInReservationCard();
      }, 300);  // 0.3秒後(スライドアウトのアニメーションが終わったタイミング)
    } else {  // 選択した投稿がまだないとき
      // 上との違いはアニメーションによる遅延があるかないか
      this.selectedReservation = await this.reservationService.getReservation(e.target.options.title);
    }
    // setTimeout(() => this.slideInReservationCard(), 500);

    this.map.setView([e.latlng.lat, e.latlng.lng], this.map.getZoom());
    
    
    // アニメーションがない場合
    // this.selectedReservation = await this.reservationService.getReservation(e.target.options.title);
    // this.map.setView([e.latlng.lat, e.latlng.lng], this.map.getZoom());

    // ルートを表示する処理  //////////////////////////////////////////////////////////////////////////////////////////////////////
    // if (this.routeControl) {
    //   console.log('delete route');
    //   // ルートが存在するとき前のルートを削除する
    //   this.routeControl.spliceWaypoints(0, 2);  // 無駄にコントロールが増える
    //   // this.routeControl.removeControl();  // not working
    //   // this.routeControl.clearLayers();  // not working
    // }
    // console.log('add route');
    // this.routeControl = this.L.Routing.control({
    //   waypoints: [
    //     this.L.latLng(this.selectedReservation.departure_point.latitude, this.selectedReservation.departure_point.longitude),   // 37.506801 139.930428
    //     this.L.latLng(this.selectedReservation.destination_point.latitude, this.selectedReservation.destination_point.longitude)   // 東山温泉 37.47972 139.96083
    //   ]
    // }).addTo(this.map);
    // this.routeControl.hide();
    // ルートを表示する処理 ここまで  //////////////////////////////////////////////////////////////////////////////////////////////
  }

  // 投稿の出発地か目的地が表示されているマップ内か判定
  isReservationInDisplayMap(reservation: Reservation){
    // console.log('reservation:', reservation);
    return this.isCoordinateInDisplayMap(reservation.departure_point)
            || this.isCoordinateInDisplayMap(reservation.destination_point);
  }

  // 座標が表示されているマップ内か判定
  isCoordinateInDisplayMap(coordinate) {
    return ((this.posSE.lat < coordinate.latitude) && (coordinate.latitude < this.posNW.lat))
            && ((this.posNW.lng < coordinate.longitude) && (coordinate.longitude < this.posSE.lng))
  }

  // 投稿の詳細画面に移動する
  goToReservationDetail(uid: String) {
    this.navController.navigateForward('/app/tabs/reservations/detail/' + uid);
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
  async applyFilterToReservations() {
    // filter内の募集状況が"すべて"でないとき募集状況で絞り込む
    if (this.filter.condition !== 'すべて') {
      await this.filterReservationsByCondition(this.filter.condition);
    }

    // filter内の出発地が空でないとき出発地で絞り込む
    if (this.filter.departure_name) {
      await this.filterReservationsByDepartureName(this.filter.departure_name);
    }

    // filter内の目的地が空でないとき目的地で絞り込む
    if (this.filter.destination_name) {
      await this.filterReservationsByDestinationName(this.filter.destination_name);
    }

    // filter内の乗車可能人数で絞り込む
    await this.filterReservationsByPassengerCapacity(this.filter.passenger_capacity);

    // filter内の出発期間で絞り込む
    await this.filterReservationsByDepartureTime(this.filter.departure_time_start, this.filter.departure_time_end);
    console.log('reservations:', this.reservations);
    console.log('end apply');
  }

  slideInReservationCard() {
    console.log("slideIn");
    this.reservationCardAnim = "slideIn";
  }

  slideOutReservationCard() {
    console.log("slideOut");
    this.reservationCardAnim = "slideOut";
  }

  endSlideOutReservationCard(reservation: Reservation) {
    this.selectedReservation = reservation;
    this.slideInReservationCard();
  }

  updateSelectedReservation(reservation: Reservation) {
    if (this.selectedReservation) {
      // カードがある場合
      this.slideOutReservationCard();
      
    } else {
      // カードがない場合
      this.selectedReservation = reservation;
      this.slideInReservationCard();
    }
  }

  rmResponse(e: any){
    e.stopPropagation();
  }
}
