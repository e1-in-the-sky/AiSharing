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

  async addUser(email: string, password: string, name: string) {
    // add user information to authentication and firestore.
    console.log('Display Name: ' + name + '\nE-mail: ' + email + '\nPassword' + password);
    var uid = '';
    await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((usercredential) => {
        var user = new User({
          uid: usercredential.user.uid,
          name: name,
          imageURL: 'default',
          introduction: 'よろしくお願いします。',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        usercredential.user.updateProfile({
          displayName: user.name,
          photoURL: user.imageURL
        });
        this.db
          .collection('users').doc(usercredential.user.uid)
          .set(user.deserialize());
        uid = usercredential.user.uid;
        console.log(usercredential.user);
      });
    return uid;
  }

  async getUser(uid) {
    // get user information from firestore by user uid.
    var userRef = await this.db.collection('users').doc(uid).ref;
    var user: User;
    await userRef.get().then(doc => {
      if (!doc.exists) {
        console.log('No such doc');
      } else {
        user = new User(doc.data());
        console.log('User:', this.user);
        return user;
      }
    })
    .catch(err => {
      console.log('error', err);
    });
    return user;
  }

  updateUser(uid, user) {
    // update User information
    // authentication and firestore
  }
}
