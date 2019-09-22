import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class YahooService {
  appid: string = 'dj00aiZpPTM0eVQwUUlPM0s0VSZzPWNvbnN1bWVyc2VjcmV0Jng9ZDI-';
  static_map_request_url: string = 'https://map.yahooapis.jp/map/V1/static';
  course_map_request_url: string = 'https://map.yahooapis.jp/course/V1/routeMap';
  local_serch_url: string = 'https://map.yahooapis.jp/search/local/V1/localSearch';
  reverse_geo_coder_url: string = 'https://map.yahooapis.jp/geoapi/V1/reverseGeoCoder';
  map_js_url: string = 'https://map.yahooapis.jp/js/V1/jsapi';

  constructor(
    private http: HttpClient
  ) { }

  getYahooMaps(): Promise<any>  {
    const win = window as any;
    // console.log('win:', win);
    // console.log('win.google:', win.google);
    // const googleModule = win.google;
    // if (googleModule && googleModule.maps) {
    //   return Promise.resolve(googleModule.maps);
    // }

    return new Promise((resolve, reject) => {
      // const apiKey = 'AIzaSyB8pf6ZdFQj5qw7rc_HSGrhUwQKfIe9ICw';
      const script = document.createElement('script');
      // script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=3.31`;
      script.src = this.map_js_url + '?appid=' + this.appid;
      // script.async = true;
      // script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        console.log('win(2):', win);
        console.log('win.google(2):', win.google);
        console.log('win.Y:', win.Y);
        // const googleModule2 = win.google;
        // if (googleModule2 && googleModule2.maps) {
        //   resolve(googleModule2.maps);
        if (win.Y) {
          resolve(win.Y);
        } else {
          reject('Yahoo maps not available');
        }
      };
    });
  }

  get_mapimg_url(param) {
    var query = new URLSearchParams(param).toString();
    // console.log(query);
    return this.static_map_request_url + '?appid=' + this.appid + '&' + query;
  }

  // https://map.yahooapis.jp/course/V1/routeMap
  getCourse(
    departure_point: firebase.firestore.GeoPoint,
    destination_point: firebase.firestore.GeoPoint,
    param,
    departure_name: string = '',
    destination_name: string = ''
    ) {
    var route = departure_point.latitude.toString() + ','
    + departure_point.longitude.toString() + ','
    + destination_point.latitude.toString() + ','
    + destination_point.longitude.toString();

    var text = '';

    param.appid = this.appid;
    param.route = route;
    var query = new URLSearchParams(param).toString();

    // departure_nameが存在する場合
    if (departure_name){ 
      text += '&text=' + departure_point.latitude.toString() + ',' + departure_point.longitude.toString()
              + '|label:' + departure_name;
    }

    // destination_nameが存在する場合
    if (destination_name) {
      text += '&text=' + destination_point.latitude.toString() + ',' +destination_point.longitude.toString()
              + '|label:' + destination_name;
    }

    // textが空でないとき
    query += text;
    
    return this.course_map_request_url + '?' + query;
  }

  async getLocalInfo(param) {
    // https://map.yahooapis.jp/search/local/V1/localSearch?appid=＜あなたのアプリケーションID＞&query=%E3%83%A9%E3%83%BC%E3%83%A1%E3%83%B3
    param.appid = this.appid;
    param.output = "json";
    var query = new URLSearchParams(param).toString();
    return this.http.jsonp(this.local_serch_url + '?' + query, "callback");
  }

  async getAddress(param) {
    // https://map.yahooapis.jp/geoapi/V1/reverseGeoCoder?lat=35.68381981&lon=139.77456498&appid=<あなたのアプリケーションID>
    param.appid = this.appid;
    param.output = "json";
    var query = new URLSearchParams(param).toString();
    return this.http.jsonp(this.reverse_geo_coder_url + '?' + query, "callback");
  }
}
