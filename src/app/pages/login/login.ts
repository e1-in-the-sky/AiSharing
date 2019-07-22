import { Component, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, Events } from '@ionic/angular';

import { UserData } from '../../providers/user-data';

import { UserOptions } from '../../interfaces/user-options';
import * as firebase from 'firebase';



@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  styleUrls: ['./login.scss'],
})
export class LoginPage {
  data: { email: string, password: string } = { email: '', password: '' };
  submitted = false;

  constructor(
    public events: Events,
    public router: Router,
    public alertController: AlertController
  ) { }

  async onLogin() {
    this.submitted = true;

    try {
      await firebase
        .auth()
        .signInWithEmailAndPassword(this.data.email, this.data.password)
        .then(user => {
          this.events.publish('user:login');
          this.router.navigateByUrl('/app/tabs/reservations');
        }, async error => {
          const alert = await this.alertController.create({
            header: '警告',
            message: error.message,
            buttons: ['OK']
          });
          alert.present();
        });

    } catch (error) {
      const alert = await this.alertController.create({
        header: '警告',
        message: error.message,
        buttons: ['OK']
      });
      alert.present();
    }

  }

  onSignup() {
    this.router.navigateByUrl('/signup');
  }
}
