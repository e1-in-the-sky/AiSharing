import { Component, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, Events } from '@ionic/angular';
import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';

import { UserData } from '../../providers/user-data';

import { UserOptions } from '../../interfaces/user-options';



@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
  styleUrls: ['./signup.scss'],
})
export class SignupPage {
  data: { displayName: string, email: string, password: string } = { displayName: '', email: '', password: '' };
  submitted = false;

  constructor(
    public events: Events,
    public router: Router,
    public alertController: AlertController,
    private db: AngularFirestore
  ) {}

  async onSignup() {
    this.submitted = true;
    try {
      console.log('Display Name: ' + this.data.displayName + '\nE-mail: ' + this.data.email + '\nPassword' + this.data.password);
      await firebase
        .auth()
        .createUserWithEmailAndPassword(this.data.email, this.data.password)
        .then((user) => {
          user.user.updateProfile({
            displayName: this.data.displayName,
            photoURL: 'default'
          });
          this.db
            .collection('users').doc(user.user.uid)
            .set({uid: user.user.uid, introduction: 'よろしくお願いします。', reservations: []});
          console.log(user.user);
        });

        this.events.publish('user:signup');
      this.router.navigateByUrl('app/tabs/reservations');

    } catch (error) {
      const alert = await this.alertController.create({
        header: '警告',
        message: error.message,
        buttons: ['OK']
      });
      alert.present();
    }
  }
}
