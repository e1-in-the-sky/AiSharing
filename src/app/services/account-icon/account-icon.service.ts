import { Injectable } from '@angular/core';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})

export class AccountIconService {

  constructor() { }

  async getIconImageURL(uid) {
    try {
      var res = await firebase.storage().ref().child('icon/' + uid + '.jpg').getDownloadURL();
      return res;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getDefaultIconImageURL() {
    try {
      var res = await firebase.storage().ref().child('icon/default.jpg').getDownloadURL();
      return res;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async addIconImage(uid, imageFile) {
    var storageRef = firebase.storage().ref('icon/' + uid);
    var snapshot = await storageRef.put(imageFile);
    return await snapshot.ref.getDownloadURL()
  }
}
