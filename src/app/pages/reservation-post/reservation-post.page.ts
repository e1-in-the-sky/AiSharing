import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'reservation-post',
  templateUrl: './reservation-post.page.html',
  styleUrls: ['./reservation-post.page.scss'],
})
export class ReservationPostPage implements OnInit {
  data: { departure: string, destination: string, departure_time: string, comment: string }
    = { departure: '', destination: '', departure_time: '', comment: 'よろしくお願いします。' };

  maxPassengerCount: number = 4;
  passengerCount: number = 1;

  constructor() { }

  ngOnInit() {
  }

  onPost() {
    console.log(this.data);
    console.log('maxPassengerCount:', this.maxPassengerCount);
    console.log('passengerCount:', this.passengerCount);
  }

}
