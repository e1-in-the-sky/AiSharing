import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'reservation-post',
  templateUrl: './reservation-post.page.html',
  styleUrls: ['./reservation-post.page.scss'],
})
export class ReservationPostPage implements OnInit {
  data: { departure: string, destination: string, departure_time: string, comment: string }
    = { departure: '', destination: '', departure_time: '', comment: 'よろしくお願いします。' };

  constructor() { }

  ngOnInit() {
  }

  onPost() {
    console.log(this.data);
  }

}
