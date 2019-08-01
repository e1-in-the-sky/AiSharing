import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ReservationUsers } from '../../models/reservation-users';
import { User } from '../../models/user';

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

  async getReservationUsers(uid) {
    // get reservation users from firestore by uid
    console.log('getReservationUsers in reservation-users.service.ts\nuid:', uid);
    var reservationUsersRef = await this.db.collection('reservations_users').doc(uid).ref;
    var reservationUsers: ReservationUsers;

    await reservationUsersRef.get().then(doc => {
      if (!doc.exists) {
        console.log('No such doc');
      } else {
        reservationUsers = new ReservationUsers(doc.data());
      }
    })
    .catch(err => {
      console.log('error', err);
    });
    return reservationUsers;
  }

  async getReservationUsersByReservationUid(reservation_uid) {
    // Get user list by reservation_uid
    console.log('getReservationUsersByReservationUid in reservation-users.service.ts\nreservation_uid:', reservation_uid);
    var reservationUsersRef = await this.db.collection('reservations_users').ref;
    var reservationRef = await this.db.collection('reservations').doc(reservation_uid).ref;
    var users: User[] = [];
    await reservationUsersRef.where('reservation', '==', reservationRef).get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          doc.data().user.get().then(user => {users.push(new User(user.data()))});
          console.log(doc.id, "=>", doc.data());
        });
      });
    return users;
  }

  async addReservationUsers(reservation_users: ReservationUsers) {
    // add new reservation users to firestore
    await this.db.collection('reservations_users')
      .add(reservation_users.deserialize())
      .then(docRef => {
        console.log("Document written with ID: ", docRef.id);
      })
      .catch(error => {
        console.error("Error adding document: ", error);
      });
  }

  async updateReservationUsers(reservation_users_uid: string, reservation_users: ReservationUsers) {
    // update reservation users in firestore by reservation_users_uid and reservation_users
    await this.db.collection('reservations_users').doc(reservation_users_uid)
      .update(reservation_users.deserialize())
      .then(() => {
        console.log("Document successfully updated!");
      });
  }

  async deleteReservationUsers(reservation_users_uid: string) {
    // delete reservation users in firestore by reservation_users_uid
    await this.db.collection('reservations_users').doc(reservation_users_uid)
      .delete()
      .then(() => {
        console.log("Document successfully deleted!");
      }).catch(error => {
        console.error("Error removing document: ", error);
      });
  }
}
