import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { ConferenceData } from '../../providers/conference-data';
import { Platform } from '@ionic/angular';
import { LeafletService } from '../../services/leaflet/leaflet.service';
import { ReservationService } from '../../services/reservation/reservation.service';
import { Reservation } from '../../models/reservation';

@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
  styleUrls: ['./map.scss']
})
export class MapPage implements OnInit{
  @ViewChild('mapCanvas') mapElement: ElementRef;

  L: any;
  map: any;
  markerClusterGroup: any;
  reservations: Reservation[] = [];
  reservationMarkers: any;

  zoom: number;
  posCenter: any;
  posNW: any;
  posSE: any;

  constructor(
    public confData: ConferenceData,
    public platform: Platform,
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

  // async ngAfterViewInit() {
  async ngOnInit() {
    this.prepareLeafletMap();
  //  this.reservations = await this.reservationService.getReservations();
  }

  async ionViewWillEnter() {
    // this.getMapPosition();
    this.reservations = await this.reservationService.getReservations();
    // this.setMarkers();
  }

  async prepareLeafletMap() {
    this.L = await this.leafletService.getLeafletMaps();
    //地図を表示するdiv要素のidを設定
    this.map = this.L.map('map');
    //地図の中心とズームレベルを指定
    this.map.setView([35.681236, 139.767125], 11);  // 東京駅 35.681236 139.767125
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
    //オープンストリートマップのタイル
    var osm = this.L.tileLayer('http://tile.openstreetmap.jp/{z}/{x}/{y}.png',
      {  attribution: "<a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors" });
    //baseMapsオブジェクトのプロパティに3つのタイルを設定
    var baseMaps = {
      "地理院地図" : gsi,
      "淡色地図" : gsipale,
      "オープンストリートマップ"  : osm
    };
    //layersコントロールにbaseMapsオブジェクトを設定して地図に追加
    //コントロール内にプロパティ名が表示される
    this.L.control.layers(baseMaps).addTo(this.map);
    osm.addTo(this.map);
    // gsi.addTo(this.map);

    this.markerClusterGroup = await this.leafletService.getLeafletMarkerCluster();
    // console.log('markerClusterGroup:', this.markerClusterGroup);
    this.reservationMarkers = this.markerClusterGroup();
    // console.log('reservationMarkers:', this.reservationMarkers);

    this.getMapPosition();
    this.setMarkers();

    // マップが動いた時の処理
    this.map.on('moveend', (e) => {
      this.getMapPosition();
      this.setMarkers();
    });

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
    // this.reservationMarkers = [];
    this.reservationMarkers = this.markerClusterGroup();
    // var displayReservations = this.reservations.filter(reservation => this.isReservationInDisplayMap(reservation));
    var displayReservations = this.reservations;
    // console.log('displayReservations:', displayReservations)
    displayReservations.forEach(reservation => this.setReservationMarker(reservation));
    this.map.addLayer(this.reservationMarkers);
  }

  setReservationMarker(reservation: Reservation) {
    var departureMarker = this.L.marker([reservation.departure_point.latitude, reservation.departure_point.longitude], {title: reservation.departure_name});
    // departureMarker.addTo(this.map);
    departureMarker.bindPopup(reservation.departure_name);
    var destinationMarker = this.L.marker([reservation.destination_point.latitude, reservation.destination_point.longitude], {title: reservation.destination_name});
    // destinationMarker.addTo(this.map);
    destinationMarker.bindPopup(reservation.destination_name);

    // this.reservationMarkers.push(departureMarker);
    // this.reservationMarkers.push(destinationMarker);
    this.reservationMarkers.addLayer(departureMarker);
    this.reservationMarkers.addLayer(destinationMarker);
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
  
}
