import { AfterViewInit, Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AlertController, Events } from '@ionic/angular';

import { UserData } from '../../providers/user-data';

import * as firebase from 'firebase';
import { UserService } from '../../services/user/user.service';
import { ReservationService } from '../../services/reservation/reservation.service';


@Component({
  selector: 'page-account',
  templateUrl: 'account.html',
  styleUrls: ['./account.scss'],
})
export class AccountPage implements AfterViewInit {
  accountId: string;
  username: string;

  constructor(
    public events: Events,
    public alertCtrl: AlertController,
    public router: Router,
    public userData: UserData,
    private route: ActivatedRoute,
    private userService: UserService,
    private reservationService: ReservationService
  ) { }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getAccountId();
      // this.getUsername();
      this.getUser();
      this.getUserReservations();
    });
  }

  // updatePicture() {
  //   console.log('Clicked to update picture');
  // }

  // Present an alert with the current username populated
  // clicking OK will update the username and display it
  // clicking Cancel will close the alert and do nothing
  // async changeUsername() {
  //   const alert = await this.alertCtrl.create({
  //     header: 'Change Username',
  //     buttons: [
  //       'Cancel',
  //       {
  //         text: 'Ok',
  //         handler: (data: any) => {
  //           this.userData.setUsername(data.username);
  //           this.getUsername();
  //         }
  //       }
  //     ],
  //     inputs: [
  //       {
  //         type: 'text',
  //         name: 'username',
  //         value: this.username,
  //         placeholder: 'username'
  //       }
  //     ]
  //   });
  //   await alert.present();
  // }

  getUsername() {
    // this.userData.getUsername().then((username) => {
    //   this.username = username;
    // });
    this.username = firebase.auth().currentUser.displayName;
  }

  getAccountId() {
    this.accountId = this.route.snapshot.paramMap.get('accountId');
  }

  getUser() {
    // get user from firestore
    console.log('in getUser(account.ts)\nuser uid:', this.accountId);
    this.userService.getUser(this.accountId);
  }

  getUserReservations(){
    // get reservations posted by this user
    console.log('in getUserReservations(account.ts)\nuser uid:', this.accountId);
    this.reservationService.getUserReservations(this.accountId);
  }

  // changePassword() {
  //   console.log('Clicked to change password');
  // }

  // logout() {
  //   // this.userData.logout();
  //   firebase.auth().signOut();
  //   this.events.publish('user:logout');
  //   this.router.navigateByUrl('/login');
  // }

  // support() {
  //   this.router.navigateByUrl('/support');
  // }
}
