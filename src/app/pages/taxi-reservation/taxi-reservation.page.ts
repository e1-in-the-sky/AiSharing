import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'taxi-reservation',
  templateUrl: './taxi-reservation.page.html',
  styleUrls: ['./taxi-reservation.page.scss'],
})
export class TaxiReservationPage implements OnInit {
  data_order = "left";

  constructor() { }

  ngOnInit() {
  }

  animationend(){
    // console.log('animation is end');
    this.data_order = this.data_order === "left" ? "right" : "left";
  }

}
