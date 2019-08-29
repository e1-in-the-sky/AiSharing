import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ReservationUsers } from '../../models/reservation-users';
import { User } from '../../models/user';
import { Reservation } from '../../models/reservation';
import { ReservationService } from '../reservation/reservation.service';

@Injectable({
  providedIn: 'root'
})
export class ReservationUsersService {

  constructor(
    private db: AngularFirestore,
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
    // Get ReservationUser list by reservation_uid
    console.log('getReservationUsersByReservationUid in reservation-users.service.ts\nreservation_uid:', reservation_uid);
    var reservationUsersRef = await this.db.collection('reservations_users').ref;
    var reservationRef = await this.db.collection('reservations').doc(reservation_uid).ref;
    // var users: User[] = [];
    var reservationUsers: ReservationUsers[] = [];
    await reservationUsersRef.where('reservation', '==', reservationRef).get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          reservationUsers.push(new ReservationUsers(doc.data()));
          console.log(doc.id, "=>", doc.data());
        });
      });
    return reservationUsers;
  }

  async getUsersByReservationUid(reservation_uid) {
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

  async getReservationsByUserUid(user_uid) {
    // user_uidのユーザーが乗る予定の投稿一覧を取得する
    console.log('getReservationByUserUid in reservation-user.service.ts\nuser_uid:', user_uid);
    var reservationUsersRef = await this.db.collection('reservations_users').ref;
    var userRef = await this.db.collection('users').doc(user_uid).ref;
    var reservations: Reservation[] = [];
    var querySnapshot = await reservationUsersRef.where('user', '==', userRef).get();
    await querySnapshot.forEach(async doc => {
      var reservation = await doc.data().reservation.get();
      reservations.push(new Reservation(reservation.data()));
    });
    console.log('before:', reservations);
    var after = reservations.sort((a, b) => {
      var a_time: Date = a.departure_time instanceof Date ? a.departure_time : a.departure_time.toDate();
      var b_time: Date = b.departure_time instanceof Date ? b.departure_time : b.departure_time.toDate();
      return (a_time.getTime() < b_time.getTime() ? 1 : -1);
      // return a_time.getTime() - b_time.getTime();
    });
    console.log('after(after):', after);
    console.log('after(reservatins):', reservations);
    return reservations;
  }

  async getUserRefsByReservationUid(reservation_uid) {
    // Get user list by reservation_uid
    console.log('getReservationUsersByReservationUid in reservation-users.service.ts\nreservation_uid:', reservation_uid);
    var reservationUsersRef = await this.db.collection('reservations_users').ref;
    var reservationRef = await this.db.collection('reservations').doc(reservation_uid).ref;
    var users: firebase.firestore.DocumentReference[] = [];
    await reservationUsersRef.where('reservation', '==', reservationRef).get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          // doc.data().user.get().then(user => {users.push(new User(user.data()))});
          doc.data().user.get().then(user => {users.push(user.ref)});
          console.log(doc.id, "=>", doc.data());
        });
      });
    return users;
  }

  async addReservationUsers(reservation_users: ReservationUsers) {
    // add new reservation users to firestore
    // await this.db.collection('reservations_users')
    //   .add(reservation_users.deserialize())
    //   .then(docRef => {
    //     console.log("Document written with ID: ", docRef.id);
    //   })
    //   .catch(error => {
    //     console.error("Error adding document: ", error);
    //   });

    if (reservation_users.uid == '') {
      const newReservationUserId = this.db.createId();
      reservation_users.uid = newReservationUserId;
    }
    var newReservationUserDoc = this.db.collection('reservations_users').doc(reservation_users.uid);
    await newReservationUserDoc.set(reservation_users.deserialize());
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
    // 投稿の情報を変更
    await this.getReservationUsers(reservation_users_uid)
      .then(reservationUsers => {
        var reservation: Reservation;
        reservationUsers.reservation.get()
          .then(doc => {
            reservation = new Reservation(doc.data())
            reservation.passenger_count -= reservationUsers.passenger_count;
            reservation.updated_at = new Date();
            reservationUsers.reservation.update(reservation.deserialize());
          });
      });
    
    // 投稿のユーザーを削除
    await this.db.collection('reservations_users').doc(reservation_users_uid)
      .delete()
      .then(() => {
        console.log("Document successfully deleted!");
      }).catch(error => {
        console.error("Error removing document: ", error);
      });
  }
}
