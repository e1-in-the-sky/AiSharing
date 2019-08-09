import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user/user.service';
import * as firebase from 'firebase';

@Component({
  selector: 'mypage-edit',
  templateUrl: './mypage-edit.page.html',
  styleUrls: ['./mypage-edit.page.scss'],
})
export class MypageEditPage implements OnInit {
  user: User = new User();

  constructor(
    private userService: UserService
  ) { }

  ngOnInit() {
    // アカウント情報の取得
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // サインインしている状態
        this.user = await this.userService.getUser(user.uid);
      } else {
        // サインインしていない状態
        // throw new Error();
      }
    });
  }

}
