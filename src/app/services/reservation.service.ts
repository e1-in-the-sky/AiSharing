import { Injectable } from '@angular/core';
import { Reservation } from '../models/reservation';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  // user1 = new User('1', 'm21@u-aizu', 'pass', 'aihara', '../../../assets/img/speakers/bear.jpg', 'hello!');
  // user1 = new User('1', 'aihara', '../../../assets/img/speakers/bear.jpg', 'こんにちは', new Date(), new Date());
  user1 = new User({uid: '1', name: 'aihara', imageURL: '../../../assets/img/speakers/bear.jpg', introduction: 'こんにちは', createdAt: new Date(), updatedAt: new Date()});
  reservation1 = new Reservation(this.user1, '会津大学', '会津若松駅', '18:00', 1, '募集中', '募集してまーす', [], '10:00');
  // user2 = new User('2', 'm21@u-', 'passwd', 'user2', '../../../assets/img/speakers/cheetah.jpg', 'I\'m user2.');
  user2 = new User({uid: '2', name: 'user2', imageURL: '../../../assets/img/speakers/cheetah.jpg', introduction: 'I\'m user2.', createdAt: new Date(), updatedAt: new Date()});
  reservation2 = new Reservation(this.user2, '会津若松駅', '鶴ケ城', '10:00', 2, '募集中', '鶴ヶ城に行きます', [], '9:00');
  // user3 = new User('3', 'user3@g', 'pw', 'user3', '../../../assets/img/speakers/duck.jpg', 'I\'m user3');
  user3 = new User({uid: '3', name: 'user3', imageURL: '../../../assets/img/speakers/duck.jpg', introduction: 'I\'m user3', createdAt: new Date(), updatedAt: new Date()});
    reservation3 = new Reservation(this.user3, '中央病院', '一箕町', '15:00', 1, '募集中', '病院から帰ります', [], '14:30');
  reservations: Reservation[] = [this.reservation1, this.reservation2, this.reservation3];

  constructor() { }

  getReservations(): Reservation[] {
    return this.reservations;
  }
}
