import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from '../../models/user';
// import { User } from '../../interfaces/user';

import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user: User;

  constructor(
    private db: AngularFirestore
  ) {  }

  async getUser(uid) {
    var userRef = await this.db.collection('users').doc(uid).ref;
    await userRef.get().then(doc => {
      if (!doc.exists) {
        console.log('No such doc');
      } else {
        this.user = new User(doc.data());
        console.log('User:', this.user);
        return this.user;
      }
    })
    .catch(err => {
      console.log('error', err);
    });
    return this.user;
  }
}
