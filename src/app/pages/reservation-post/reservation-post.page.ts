import { Component, OnInit } from '@angular/core';
import { Reservation } from '../../models/reservation';

import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';
import { ReservationService } from '../../services/reservation/reservation.service';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'reservation-post',
  templateUrl: './reservation-post.page.html',
  styleUrls: ['./reservation-post.page.scss'],
})
export class ReservationPostPage implements OnInit {
  data: { 
    departure_name: string,
    destination_name: string,
    departure_point: firebase.firestore.GeoPoint,
    destination_point: firebase.firestore.GeoPoint,
    departure_time: string,
    max_passenger_count: number,
    passenger_count: number,
    comment: string,
    condition: string,
    created_at: Date | firebase.firestore.Timestamp,
    updated_at: Date | firebase.firestore.Timestamp
  } = {
    departure_name: '',
    destination_name: '',
    departure_point: new firebase.firestore.GeoPoint(0, 0),
    destination_point: new firebase.firestore.GeoPoint(0, 0),
    departure_time: '',
    max_passenger_count: 4,
    passenger_count: 1,
    comment: 'よろしくお願いします。',
    condition: '募集中',
    created_at: new Date(),
    updated_at: new Date()
  };

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private db: AngularFirestore,
    private reservationService: ReservationService
  ) { }

  ngOnInit() {
  }

  onPost() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // case signin
        // const newReservationId = this.db.createId();
        // var newReservationRef = this.db.collection('reservations').doc(newReservationId);

        var reservation: Reservation = new Reservation({
          uid: '',
          // owner: user.uid
          owner: this.db.collection('users').doc(user.uid).ref,
          departure_name: this.data.departure_name,
          destination_name: this.data.destination_name,
          departure_point: this.data.departure_point,
          destination_point: this.data.destination_point,
          departure_time: new Date(this.data.departure_time),
          max_passenger_count: this.data.max_passenger_count,
          passenger_count: this.data.passenger_count,
          comment: this.data.comment,
          condition: this.data.condition,
          created_at: new Date(),
          updated_at: new Date()
        });
    
        console.log(this.data);
        console.log('reservavtion:', reservation);
        // newReservationRef.set(reservation.deserialize());
        this.reservationService.addReservation(reservation).then(() => {
          // this.navCtrl.back();
          this.navCtrl.navigateBack('/app/tabs/reservations');
          // this.router.navigateByUrl('/app/tabs/reservations');
        });
      } else {
        // case signout
      }
    });
  }

}
