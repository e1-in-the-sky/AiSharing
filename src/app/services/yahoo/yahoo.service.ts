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

  constructor(
    private http: HttpClient
  ) { }

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
    param.output = "json"
    var query = new URLSearchParams(param).toString();
    return this.http.jsonp(this.local_serch_url + '?' + query, "callback");
  }
}
