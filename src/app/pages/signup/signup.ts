import { Component, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, Events } from '@ionic/angular';
import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';

import { UserData } from '../../providers/user-data';

import { UserOptions } from '../../interfaces/user-options';
import { UserService } from '../../services/user/user.service';



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
    private db: AngularFirestore,
    public userService: UserService
  ) {}

  async onSignup() {
    this.submitted = true;
    if(!this.data.displayName){
      this.alert_no_information();
      return;
    }
    
    try {
      this.userService.addUser(this.data.email, this.data.password, this.data.displayName)
        .then(uid => {
          console.log('uid:', uid);
          this.events.publish('user:signup');
          this.router.navigateByUrl('app/tabs/reservations');
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

  onGoToLogin() {
    this.router.navigateByUrl('/login');
  }

  async alert_no_information(){
    const alert = await this.alertController.create({
      message: 'Please fill in the your displayname',
      buttons: ['OK']
    });
    await alert.present();
  }

}
