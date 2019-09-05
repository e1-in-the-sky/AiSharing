import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class YahooService {
  appid: string = 'dj00aiZpPTM0eVQwUUlPM0s0VSZzPWNvbnN1bWVyc2VjcmV0Jng9ZDI-';
  static_map_request_url: string = 'https://map.yahooapis.jp/map/V1/static';
  local_serch_url: string = 'https://map.yahooapis.jp/search/local/V1/localSearch';

  constructor(
    private http: HttpClient
  ) { }

  get_mapimg_url(param) {
    var query = new URLSearchParams(param).toString();
    console.log(query);
    return this.static_map_request_url + '?appid=' + this.appid + '&' + query;
  }

  async get_local_info(param) {
    // https://map.yahooapis.jp/search/local/V1/localSearch?appid=＜あなたのアプリケーションID＞&query=%E3%83%A9%E3%83%BC%E3%83%A1%E3%83%B3
    param.appid = this.appid;

    // ver.1
    // let httpOptions = {
    //   headers: new HttpHeaders().set('Content-Type','application/json'),
    //   // headers: new HttpHeaders().set('Content-Type','application/x-www-form-urlencoded'),
    //   // headers: new HttpHeaders().set('Content-Type','application/xml'),
    //   // params: new HttpParams(param)
    //   params: new HttpParams().set('appid', this.appid).set('query', param.query)
    // };
    // this.http.get(this.local_serch_url, httpOptions).subscribe(response => {
    //   console.log('response:', response);
    // });

    // ver.2
    // var query = new URLSearchParams(param).toString();
    // this.http.get(this.local_serch_url + '?' + query, {responseType: 'text'})
    //   .subscribe(result => {console.log(result)})

    // ver.3
    var query = new URLSearchParams(param).toString();
    console.log(query);
    // console.log(this.local_serch_url + '?' + httpParams.toString());
    var result = this.http.jsonp(this.local_serch_url + '?' + query, "callback");
    console.log(result);
    result.subscribe((entry) => {
      console.log('entry:', entry);
    });

  }
}
