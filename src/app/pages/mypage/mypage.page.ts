import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { UserService } from '../../services/user/user.service';
import { User } from '../../models/user';

@Component({
  selector: 'mypage',
  templateUrl: './mypage.page.html',
  styleUrls: ['./mypage.page.scss'],
})
export class MypagePage implements OnInit {
  user: User;
  user_: any;
  uid: string;
  displayName: string;
  email: string;
  introduction: string = '';
  imageURL: string = '';

  constructor(
    private userService: UserService
  ) { }

  ngOnInit() {
    this.getCurrentUser();
  }

  getCurrentUser() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // User is signed in.
        this.userService.getUser(user.uid).then(user => {
          this.user = user;
          this.uid = user.uid;
          this.displayName = user.name;
          this.introduction = user.introduction;
          this.imageURL = user.imageURL;
        });
      }
    });
  }

}
