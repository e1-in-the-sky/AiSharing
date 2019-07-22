import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'reservation-detail',
  templateUrl: './reservation-detail.page.html',
  styleUrls: ['./reservation-detail.page.scss'],
})
export class ReservationDetailPage implements OnInit {
  reservationId = '';

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.reservationId = this.route.snapshot.paramMap.get('reservationId');
  }

}
