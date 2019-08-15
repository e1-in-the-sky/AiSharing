import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import * as firebase from 'firebase';

@Component({
  selector: 'user-chip',
  templateUrl: './user-chip.component.html',
  styleUrls: ['./user-chip.component.scss'],
})
export class UserChipComponent implements OnInit {
  @Input()
  user_ref: firebase.firestore.DocumentReference;
  user: User = new User();

  constructor(
    public router: Router
  ) { }

  ngOnInit() {
    this.set_user();
  }

  async set_user() {
    // console.log('set_user:', this.user_ref);
    await this.user_ref.get().then(doc => {
      this.user = new User(doc.data());
    });
  }

  async goToAccountDetail() {
    // for account detail page
    var account_uid = this.user.uid;
    var path = '/account/' + account_uid;
    await firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // account_uidが自分だった場合はマイページに移動
        if (user.uid == account_uid) {
          path = '/mypage';
        }
      }
    });
    this.router.navigateByUrl(path);
  }
}
