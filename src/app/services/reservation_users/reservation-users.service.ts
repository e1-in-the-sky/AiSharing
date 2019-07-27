import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ReservationUsers } from '../../models/reservation-users';

@Injectable({
  providedIn: 'root'
})
export class ReservationUsersService {

  constructor(
    private db: AngularFirestore
  ) { }

  async getReservationsUsers() {
    // get all reservations_users document from firestore
    var reservationsUsers: ReservationUsers[] = [];
    var reservationUsersRef = this.db.collection('reservations_users').ref;
    await reservationUsersRef.get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        var reservationUsers = new ReservationUsers(doc.data());
        console.log('getReservations in reservation.service.ts');
        console.log('doc.data():', doc.data());
        console.log('reservation:', reservationUsers);
        reservationsUsers.push(reservationUsers);
      });
    });
    return reservationsUsers;
  }

  async getReservationUsers(reservation_uid) {
    // get reservation users from firestore by reservation_uid
    // reservation_uid = "nWjlQVjUJQgWxfe78GSV";
    console.log('getReservationUsers in reservation-users.service.ts\nreservation_uid:', reservation_uid);
    console.log('document:', this.db.collection('reservations_users').doc(reservation_uid));
    console.log('document.ref:', this.db.collection('reservations_users').doc(reservation_uid).ref);
    var reservationUsersRef = await this.db.collection('reservations_users').doc(reservation_uid).ref;
    var reservationUsers;

    await reservationUsersRef.get().then(doc => {
      console.log('doc:', doc);
      console.log('doc.data():', doc.data());
      console.log('doc[0]:', doc[0]);
      console.log('doc[0].data:', doc[0].data());

      if (!doc.exists) {
        console.log('No such doc');
      } else {
        reservationUsers = new ReservationUsers(doc.data());
        console.log('doc.data():', doc.data());
        console.log('reservation:', reservationUsers);
      }
    })
    .catch(err => {
      console.log('error', err);
    });
    return reservationUsers;
  }

  addReservationUsers(reservation_users) {
    // add new reservation users to firestore
  }

  updateReservationUsers(reservation_users_uid, reservation_users) {
    // update reservation users in firestore by reservation_users_uid and reservation_users
  }

  deleteReservationUsers(reservation_users_uid) {
    // delete reservation users in firestore by reservation_users_uid
  }
}
