import { Injectable } from '@angular/core';
import { Reservation } from '../../models/reservation';
import { User } from '../../models/user';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { ReservationUsers } from '../../models/reservation-users';
import { ReservationUsersService } from '../reservation_users/reservation-users.service';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  // // user1 = new User('1', 'm21@u-aizu', 'pass', 'aihara', '../../../assets/img/speakers/bear.jpg', 'hello!');
  // // user1 = new User('1', 'aihara', '../../../assets/img/speakers/bear.jpg', 'こんにちは', new Date(), new Date());
  // user1 = new User({uid: '1', name: 'aihara', imageURL: '../../../assets/img/speakers/bear.jpg', introduction: 'こんにちは', createdAt: new Date(), updatedAt: new Date()});
  // reservation1 = new Reservation(this.user1, '会津大学', '会津若松駅', '18:00', 1, '募集中', '募集してまーす', [], '10:00');
  // // user2 = new User('2', 'm21@u-', 'passwd', 'user2', '../../../assets/img/speakers/cheetah.jpg', 'I\'m user2.');
  // user2 = new User({uid: '2', name: 'user2', imageURL: '../../../assets/img/speakers/cheetah.jpg', introduction: 'I\'m user2.', createdAt: new Date(), updatedAt: new Date()});
  // reservation2 = new Reservation(this.user2, '会津若松駅', '鶴ケ城', '10:00', 2, '募集中', '鶴ヶ城に行きます', [], '9:00');
  // // user3 = new User('3', 'user3@g', 'pw', 'user3', '../../../assets/img/speakers/duck.jpg', 'I\'m user3');
  // user3 = new User({uid: '3', name: 'user3', imageURL: '../../../assets/img/speakers/duck.jpg', introduction: 'I\'m user3', createdAt: new Date(), updatedAt: new Date()});
  // reservation3 = new Reservation(this.user3, '中央病院', '一箕町', '15:00', 1, '募集中', '病院から帰ります', [], '14:30');
  // reservations: Reservation[] = [this.reservation1, this.reservation2, this.reservation3];

  constructor(
    private db: AngularFirestore,
    private reservationUsersService: ReservationUsersService
  ) { }

  async getReservation(uid){
    // get reservation from firestore by reservation uid
    var reservationRef = await this.db.collection('reservations').doc(uid).ref;
    var reservation;
    await reservationRef.get().then(doc => {
      if (!doc.exists) {
        console.log('No such doc');
      } else {
        reservation = new Reservation(doc.data());
        console.log('doc.data():', doc.data());
        console.log('reservation:', reservation);
      }
    })
    .catch(err => {
      console.log('error', err);
    });
    return reservation;
  }

  async getReservationRef(uid) {
    var reservationRef = await this.db.collection('reservations').doc(uid).ref;
    return reservationRef;
  }

  async getReservations() {
    // var user1 = new User({uid: '1', name: 'aihara', imageURL: '../../../assets/img/speakers/bear.jpg', introduction: 'こんにちは', createdAt: new Date(), updatedAt: new Date()});
    // var reservation1 = new Reservation({owner: user1, departure: '会津大学', destination: '会津若松駅', departure_time: '18:00', passengerCount: 1, condition: '募集中', message: '募集してまーす', chats: [], published_time: '10:00'});
    // var user2 = new User({uid: '2', name: 'user2', imageURL: '../../../assets/img/speakers/cheetah.jpg', introduction: 'I\'m user2.', createdAt: new Date(), updatedAt: new Date()});
    // var reservation2 = new Reservation({owner: user2, departure: '会津若松駅', destination: '鶴ケ城', departure_time: '10:00', passengerCount: 2, condition: '募集中', message: '鶴ヶ城に行きます', chats: [], published_time: '9:00'});
    // var user3 = new User({uid: '3', name: 'user3', imageURL: '../../../assets/img/speakers/duck.jpg', introduction: 'I\'m user3', createdAt: new Date(), updatedAt: new Date()});
    // var reservation3 = new Reservation({owner: user3, departure: '中央病院', destination: '一箕町', departure_time: '15:00', passengerCount: 1, condition: '募集中', message: '病院から帰ります', chats: [], published_time: '14:30'});
    // var reservations: Reservation[] = [reservation1, reservation2, reservation3];
    var reservations: Reservation[] = [];
    var reservationsRef = this.db.collection('reservations').ref;
    await reservationsRef.orderBy('departure_time').get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        var reservation = new Reservation(doc.data());
        console.log('getReservations in reservation.service.ts');
        console.log('doc.data():', doc.data());
        console.log('reservation:', reservation);
        reservations.push(reservation);
      });
    });
    return reservations;
  }

  async getUserReservations(user_uid) {
    // get reservations of User's(user_uid)
    console.log('in getUserReservations(reservation.service.ts)\nuser_uid:', user_uid);
    var reservations: Reservation[] = [];
    var reservationsRef = this.db.collection('reservations').ref;
    var ownerRef = this.db.collection('users').doc(user_uid).ref;
    await reservationsRef.where('owner', '==', ownerRef).get().then(querySnapshot => {  // departure_timeとかで並び替えしたい
      querySnapshot.forEach(doc => {
        var reservation = new Reservation(doc.data());
        // console.log('getReservations in reservation.service.ts');
        // console.log('doc.data():', doc.data());
        // console.log('reservation:', reservation);
        reservations.push(reservation);
      });
    });
    return reservations;
  }

  // ユーザーの中にreservation collectionが存在する場合
  // async getUserReservations(user_uid) {
  //   // get reservations of User's(user_uid)
  //   console.log('in getUserReservations(reservation.service.ts)\nuser_uid:', user_uid);
  //   var reservations: Reservation[] = [];
  //   var reservationsRef = this.db.collection('users').doc(user_uid).collection('reservations').ref;
  //   await reservationsRef.get().then(querySnapshot => {  // departure_timeとかで並び替えしたい
  //     querySnapshot.forEach(reservationRef => {
  //       console.log('reservationRef:', reservationRef);
  //       console.log('reservationRef.data():', reservationRef.data());
  //       reservationRef.data().reservationRef.get().then(doc => {
  //         console.log('doc:', doc);
  //         console.log('doc.data():', doc.data());
  //         reservations.push(new Reservation(doc.data()));
  //       });
  //     });
  //   });
  //   return reservations;
  // }

  getRideReservations(user_uid) {
    // get reserved reservations by User(user_uid)
  }

  async addReservation(reservation: Reservation){
    // add reservation to firestore
    if (reservation.uid == '') {
      const newReservationId = this.db.createId();
      reservation.uid = newReservationId;
    }
    var newReservationDoc = this.db.collection('reservations').doc(reservation.uid);
    await newReservationDoc.set(reservation.deserialize());

    // set reservation users relation
    var reservation_users: ReservationUsers
      = new ReservationUsers({
        reservation: newReservationDoc.ref,
        user: reservation.owner,
        passenger_count: reservation.passenger_count
      });
    await this.reservationUsersService.addReservationUsers(reservation_users);
  }

  async updateReservation(uid: string, reservation: Reservation){
    // update reservation in firestore by uid
    console.log('update reservation\n', uid, '=>', reservation);
    reservation.updated_at = new Date();
    await this.db.collection('reservations').doc(uid)
      .update(reservation.deserialize())
      .then(() => {
        console.log("Reservation Document successfully updated!");
      });
  }

  async deleteReservation(uid){
    // delete reservation in firestore by uid
    console.log('delete reservation\nuid:', uid);
    var reservation_ref = this.db.collection('reservations').doc(uid).ref

    // reservationUsersを削除
    await this.db.collection('reservations_users').ref
      .where('reservation', '==', reservation_ref).get()
      .then(reservationUsers => {
        reservationUsers.forEach(reservationUser => {
          reservationUser.ref
            .delete()
            .then(() => {
              console.log('reservation user successfully deleted');
            });
          // this.db.collection('reservations_users')
        });
      });

      // messagesを削除
    await this.db.collection('messages').ref
      .where('reservation', '==', reservation_ref).get()
      .then(messages => {
        messages.forEach(message => {
          message.ref
            .delete()
            .then(() => {
              console.log('message successfully deleted');
            });
        });
      });

    // reservationを削除
    await reservation_ref
      .delete()
      .then(() => {
        console.log('reservation successfully deleted');
      });
  }

}
