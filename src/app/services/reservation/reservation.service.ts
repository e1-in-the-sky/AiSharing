import { Injectable } from '@angular/core';
import { Reservation } from '../../models/reservation';
import { User } from '../../models/user';

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

  constructor() { }

  getReservation(uid){
    // get reservation from firestore by reservation uid
  }

  getReservations(): Reservation[] {
    var user1 = new User({uid: '1', name: 'aihara', imageURL: '../../../assets/img/speakers/bear.jpg', introduction: 'こんにちは', createdAt: new Date(), updatedAt: new Date()});
    var reservation1 = new Reservation({owner: user1, departure: '会津大学', destination: '会津若松駅', departure_time: '18:00', passengerCount: 1, condition: '募集中', message: '募集してまーす', chats: [], published_time: '10:00'});
    var user2 = new User({uid: '2', name: 'user2', imageURL: '../../../assets/img/speakers/cheetah.jpg', introduction: 'I\'m user2.', createdAt: new Date(), updatedAt: new Date()});
    var reservation2 = new Reservation({owner: user2, departure: '会津若松駅', destination: '鶴ケ城', departure_time: '10:00', passengerCount: 2, condition: '募集中', message: '鶴ヶ城に行きます', chats: [], published_time: '9:00'});
    var user3 = new User({uid: '3', name: 'user3', imageURL: '../../../assets/img/speakers/duck.jpg', introduction: 'I\'m user3', createdAt: new Date(), updatedAt: new Date()});
    var reservation3 = new Reservation({owner: user3, departure: '中央病院', destination: '一箕町', departure_time: '15:00', passengerCount: 1, condition: '募集中', message: '病院から帰ります', chats: [], published_time: '14:30'});
    var reservations: Reservation[] = [reservation1, reservation2, reservation3];
    return reservations;
  }

  getUserReservations(user_uid) {
    // get reservations of User's(user_uid)
    console.log('in getUserReservations(reservation.service.ts)\nuser_uid:', user_uid);
  }

  getRideReservations(user_uid) {
    // get reserved reservations by User(user_uid)
  }

  addReservation(reservation){
    // add reservation to firestore
  }

  updateReservation(uid, reservation){
    // update reservation in firestore by uid
  }

  deleteReservation(uid){
    // delete reservation in firestore by uid
  }

}
