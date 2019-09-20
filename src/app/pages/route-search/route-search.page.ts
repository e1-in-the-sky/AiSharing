import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { YahooService } from '../../services/yahoo/yahoo.service';

import * as firebase from 'firebase';

@Component({
  selector: 'route-search',
  templateUrl: './route-search.page.html',
  styleUrls: ['./route-search.page.scss'],
})
export class RouteSearchPage implements OnInit {
  route_search_url = "https://us-central1-aisharing-ac6cc.cloudfunctions.net/routeSearch3"

  constructor(
    private yahooService: YahooService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.sample();
  }

  async sample() {
    var param = {
      route: "37.521469,139.940061,37.395645,139.932622",
      departure_time: "2019-09-25T10:40:00"
    }
    var res = await this.getRoute(param);
    // console.log('res:', res);
    // await this.getRoute2(param);
    // res.subscribe((re) => {
    //   console.log(re);
    //   // return re;
    // }, (err) => {
    //   throw err;
    // });
    // console.log(res);

  }

  async getRoute2(param) {
    var routeSearch3 = firebase.functions().httpsCallable('routeSearch3');
    routeSearch3(param).then(function(result) {
      console.log('result:', result);
    });
  }

  async getRoute(param) {
    // https://us-central1-aisharing-ac6cc.cloudfunctions.net/routeSearch3?route=37.521469,139.940061,37.395645,139.932622&departure_time=2019-09-25T10:40:00
    if (!param.route) {
      throw Error("routeが必要");
    }

    // param.callback = "JSONP_CALLBACK";
    var query = new URLSearchParams(param).toString();
    // return this.http.jsonp( this.route_search_url + '?' + query, "callback");
    console.log(this.route_search_url + '?' + query);
    // this.http.jsonp(this.route_search_url + '?' + query, "callback")
    // let headers = new HttpHeaders({'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    // this.http.get(this.route_search_url + '?' + query, {headers: headers})
    this.http.get(this.route_search_url + '?' + query)
      .subscribe((res) => {
        console.log('res:', res);
        return res;
      }, (err) => {
        throw err;
      });
  }

}
