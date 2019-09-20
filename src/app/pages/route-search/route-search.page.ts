import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'route-search',
  templateUrl: './route-search.page.html',
  styleUrls: ['./route-search.page.scss'],
})
export class RouteSearchPage implements OnInit {
  route_search_url = "https://us-central1-aisharing-ac6cc.cloudfunctions.net/routeSearch3"

  constructor(
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
    res.subscribe((re) => {
      console.log(re);
      // return re;
    }, (err) => {
      throw err;
    });
    // console.log(res);

  }

  async getRoute(param) {
    // https://us-central1-aisharing-ac6cc.cloudfunctions.net/routeSearch3?route=37.521469,139.940061,37.395645,139.932622&departure_time=2019-09-25T10:40:00
    if (!param.route) {
      throw Error("routeが必要");
    }
    var query = new URLSearchParams(param).toString();
    // return this.http.jsonp( this.route_search_url + '?' + query, "callback");
    console.log(this.route_search_url + '?' + query);
    return this.http.jsonp(this.route_search_url + '?' + query, "callback");
      // .subscribe((res) => {
      //   return res;
      // }, (err) => {
      //   throw err;
      // });
  }

}
