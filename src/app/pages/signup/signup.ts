import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, Events, MenuController } from '@ionic/angular';
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
export class SignupPage implements OnInit {
  data: { displayName: string, email: string, password: string } = { displayName: '', email: '', password: '' };
  submitted = false;

  constructor(
    public events: Events,
    public router: Router,
    public menu: MenuController,
    public alertController: AlertController,
    private db: AngularFirestore,
    public userService: UserService
  ) {}

  ngOnInit() {
    console.log('ngOnInit');
    // this.menu.enable(false);
  }

  ionViewWillEnter() {
    this.menu.enable(false);
    console.log('ionViewWillEnter');
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter');
  }

  ionViewDidLeave() {
    // enable the root left menu when leaving the page
    console.log('ionViewDidLeave');
    // this.menu.enable(true);
  }

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
          this.menu.enable(true);
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
