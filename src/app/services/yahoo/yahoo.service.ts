import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class YahooService {
  appid: string = 'dj00aiZpPTM0eVQwUUlPM0s0VSZzPWNvbnN1bWVyc2VjcmV0Jng9ZDI-';
  static_map_request_url: string = 'https://map.yahooapis.jp/map/V1/static';

  constructor() { }

  get_mapimg_url(param) {
    var query = new URLSearchParams(param).toString();
    console.log(query);
    return this.static_map_request_url + '?appid=' + this.appid + '&' + query;
  }

  get_local_info(param) {
    // https://map.yahooapis.jp/search/local/V1/localSearch?appid=＜あなたのアプリケーションID＞&query=%E3%83%A9%E3%83%BC%E3%83%A1%E3%83%B3

  }
}
