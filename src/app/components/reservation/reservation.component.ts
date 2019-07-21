import { Component, OnInit, Input } from '@angular/core';
import { Reservation } from '../../models/reservation';

@Component({
  selector: 'reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
})
export class ReservationComponent implements OnInit {
  @Input()
  reservation: Reservation;

  constructor() { }

  ngOnInit() {}

  goToDetail(reservation: any) {
    console.log(reservation);
    console.log(reservation.owner.name);
  }
}
