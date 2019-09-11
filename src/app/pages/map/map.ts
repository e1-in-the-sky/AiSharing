import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ConferenceData } from '../../providers/conference-data';
import { Platform } from '@ionic/angular';
import { LeafletService } from '../../services/leaflet/leaflet.service';

@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
  styleUrls: ['./map.scss']
})
export class MapPage implements AfterViewInit {
  @ViewChild('mapCanvas') mapElement: ElementRef;

  L: any;
  map: any;

  constructor(
    public confData: ConferenceData,
    public platform: Platform,
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

  async ngAfterViewInit() {
   this.prepareLeafletMap(); 
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
    gsi.addTo(this.map);
  }
}
