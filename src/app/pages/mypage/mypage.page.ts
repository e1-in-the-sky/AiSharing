import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';

@Component({
  selector: 'mypage',
  templateUrl: './mypage.page.html',
  styleUrls: ['./mypage.page.scss'],
})
export class MypagePage implements OnInit {
  user: any;
  displayName: string;
  email: string;

  constructor() { }

  ngOnInit() {
    this.user = firebase.auth().currentUser;
    this.displayName = this.user.displayName;
    this.email = this.user.email;
    console.log(this.user);
  }

}
