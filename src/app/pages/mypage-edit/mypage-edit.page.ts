import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user/user.service';
import * as firebase from 'firebase';
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { AccountIconService } from '../../services/account-icon/account-icon.service';

@Component({
  selector: 'mypage-edit',
  templateUrl: './mypage-edit.page.html',
  styleUrls: ['./mypage-edit.page.scss'],
})
export class MypageEditPage implements OnInit {
  user: User = new User();
  private inputFile: any;
  imageURL: string | ArrayBuffer = '';
  inputImage: File;

  constructor(
    private userService: UserService,
    private accountIconService: AccountIconService,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    // アカウント情報の取得
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // サインインしている状態
        this.user = await this.userService.getUser(user.uid);
        this.imageURL = this.user.imageURL;
      } else {
        // サインインしていない状態
        // throw new Error();
      }
    });
  }

  async onUpdate() {
    console.log('onUpdate in mypage-edit.page.ts\nuser:', this.user);

    let loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: 'ユーザー情報の更新中...'
    });
    loading.present();

    try {
      // inputImageがあればfirebase storageにinputImageをアップロード
      if (this.inputImage) {
        var imageURL = await this.accountIconService.addIconImage(this.user.uid, this.inputImage);
        // firebase storageへのアップロードが成功したら
        // this.user.imageURL を firebase storageのURLに変更
        this.user.imageURL = imageURL;
      }

      // user情報の更新
      await this.userService.updateUser(this.user.uid, this.user);
      loading.dismiss();

      let alert = await this.alertCtrl.create({
        message: 'ユーザー情報の更新に成功しました'
      });
      alert.present();
      // this.navCtrl.navigateBack('/mypage');
      // this.navCtrl.navigateForward('/mypage');
      this.dismissModal(true);

    } catch (err) {
      console.log(err);
      loading.dismiss();

      let alert = await this.alertCtrl.create({
        message: 'ユーザー情報の更新に失敗しました'
      });
      alert.present();
    }
  }

  onCancel() {
    console.log('onCancel in mypage-edit.page.ts');
    // this.navCtrl.navigateBack('/mypage');
    this.dismissModal(false);
  }

  upload(list: any) {
    console.log('list:', list);
    if (list.length <= 0) { return; }

    this.inputImage = list[0];
    // let data = new FormData();
    // console.log('f:', this.inputImage);
    // data.append('upfile', this.inputImage, this.inputImage.name);
    // console.log('data:', data);

    var reader = new FileReader();
    reader.readAsDataURL(this.inputImage);
    reader.onload = () => {
      console.log('reader:', reader);
      console.log('reader.result:', reader.result);
      this.imageURL = reader.result;
    };

  }

  // // file選択フォームの値（＝選択ファイル）を変更すると発火
  // public fileUp(ev: Event) {
  //   console.log('ev:', ev);
  //   console.log('ev.target:', ev.target);
  //   console.log('ev.srcElement:', ev.srcElement);

  //   this.inputFile = (<HTMLInputElement>ev.srcElement).files[0];
  //   // ファイル非選択時はButtonをdisabledにします
  //   if (this.inputFile.name) { // ファイルが選択されているとき
  //     document.getElementById('js-import-file__submit').removeAttribute('disabled');
  //   } else { // ファイルが選択されていないとき
  //     document.getElementById('js-import-file__submit').setAttribute('disabled', 'disabled');
  //   }
  // }

  // async submitNewFile() {
  //   let loading = await this.loadingCtrl.create({
  //     spinner: 'circles',
  //     message: '読み込み中...'
  //   });
  //   loading.present();

  //   var reader = new FileReader();
  //   reader.readAsText(this.inputFile, "Shift-JIS");
  //   reader.onload = () => {
  //     console.log(reader.result);
  //     loading.dismiss();
  //   }
  // }

  dismissModal(isUpdate: boolean = false) {
    this.modalCtrl.dismiss({
      "isUpdate": isUpdate
    });
  }

}
