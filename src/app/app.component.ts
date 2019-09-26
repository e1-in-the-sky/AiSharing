import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';

import { Events, MenuController, Platform, ToastController, AlertController } from '@ionic/angular';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { Storage } from '@ionic/storage';

import { UserData } from './providers/user-data';

import * as firebase from 'firebase';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  appPages = [
    // {
    //   title: 'Schedule',
    //   url: '/app/tabs/schedule',
    //   icon: 'calendar'
    // },
    // {
    //   title: 'Speakers',
    //   url: '/app/tabs/speakers',
    //   icon: 'contacts'
    // },
    // {
    //   title: 'Map',
    //   url: '/app/tabs/map',
    //   icon: 'map'
    // },
    // {
    //   title: 'About',
    //   url: '/app/tabs/about',
    //   icon: 'information-circle'
    // },
    {
      title: '相乗り投稿',
      url: '/app/tabs/reservation-post',
      icon: 'paper-plane'
    },
    {
      title: '投稿一覧',
      url: '/app/tabs/reservations',
      icon: 'chatbubbles'
    },
    {
      title: 'マップ',
      url: '/app/tabs/map',
      icon: 'map'
    },
    {
      title: '相乗り検索',
      url: '/app/tabs/route-search',
      icon: 'search'
    },
    {
      title: 'タクシー予約',
      url: '/app/tabs/taxi-reservation',
      icon: 'logo-model-s'
    }
    
  ];
  loggedIn = false;

  constructor(
    private events: Events,
    private menu: MenuController,
    private platform: Platform,
    private router: Router,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: Storage,
    private userData: UserData,
    private swUpdate: SwUpdate,
    private toastCtrl: ToastController,
    private alertController: AlertController
  ) {
    this.initializeApp();
  }

  async ngOnInit() {
    this.checkLoginStatus();
    this.listenForLoginEvents();

    this.swUpdate.available.subscribe(async res => {
      const toast = await this.toastCtrl.create({
        message: 'Update available!',
        showCloseButton: true,
        position: 'bottom',
        closeButtonText: `Reload`
      });

      await toast.present();

      toast
        .onDidDismiss()
        .then(() => this.swUpdate.activateUpdate())
        .then(() => window.location.reload());
    });
  }

  async initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    firebase.initializeApp(environment.config);

    if ('serviceWorker' in navigator){
      //プッシュ通知 受信の為のサービスワーカー利用設定
      navigator.serviceWorker.register('assets/script/firebase-messaging-sw.js')
      .then(async (registration) => {
        console.log('プッシュ通知 成功');
        firebase.messaging().useServiceWorker(registration);
        // const toast = await this.toastCtrl.create({
        //   header: '成功',
        //   message: '成功',
        //   position: 'top',
        //   showCloseButton: true,
        //   closeButtonText: `閉じる`,
        //   buttons: [
        //     {
        //       side: 'start',
        //       icon: 'star',
        //       handler: () => {
        //         console.log('star');
        //         // if (payload.url){
        //         //   _self.router.navigateByUrl(payload.url);
        //         // }
        //       }
        //     }
        //   ]
        // });
        // toast.present();
      })
      .catch(async (error) => {
        console.log('プッシュ通知 失敗');
        const toast = await this.toastCtrl.create({
          header: 'AiSharing',
          message: 'プッシュ通知が利用できません(失敗)',
          position: 'top',
          showCloseButton: true,
          closeButtonText: `閉じる`,
          buttons: [
            {
              side: 'start',
              icon: 'star',
              handler: () => {
                console.log('star');
                // if (payload.url){
                //   _self.router.navigateByUrl(payload.url);
                // }
              }
            }
          ]
        });
        toast.present();
      });

    } else {
      console.log('プッシュ通知 無し');
      const toast = await this.toastCtrl.create({
        header: 'AiSharing',
        message: 'プッシュ通知が利用できません(無し)',
        position: 'top',
        showCloseButton: true,
        closeButtonText: `閉じる`,
        buttons: [
          {
            side: 'start',
            icon: 'star',
            handler: () => {
              console.log('star');
              // if (payload.url){
              //   _self.router.navigateByUrl(payload.url);
              // }
            }
          }
        ]
      });
      toast.present();
    }

    // const toast = await this.toastCtrl.create({
    //   header: '通過',
    //   message: '通過',
    //   position: 'top',
    //   showCloseButton: true,
    //   closeButtonText: `閉じる`,
    //   buttons: [
    //     {
    //       side: 'start',
    //       icon: 'star',
    //       handler: () => {
    //         console.log('star');
    //         // if (payload.url){
    //         //   _self.router.navigateByUrl(payload.url);
    //         // }
    //       }
    //     }
    //   ]
    // });
    // toast.present();

    //プッシュ通知 受信時の処理
    const _self = this;
    firebase.messaging().onMessage(function (payload) {
      //トーストを表示してみる
      _self.showNotificationToast(payload);
    }, async (err) => {
      const toast = await this.toastCtrl.create({
        header: 'AiSharing',
        message: 'メッセージの取得に失敗しました',
        position: 'top',
        showCloseButton: true,
        closeButtonText: `閉じる`,
        buttons: [
          {
            side: 'start',
            icon: 'star',
            handler: () => {
              console.log('star');
              // if (payload.url){
              //   _self.router.navigateByUrl(payload.url);
              // }
            }
          }
        ]
      });
      toast.present();
    });



  }

   //トーストを表示
   async showNotificationToast(payload:any) {
    let _self = this;
    //payload.notification.icon
    const toast = await this.toastCtrl.create({
      header: payload.notification.title,
      message: payload.notification.body,
      position: 'top',
      showCloseButton: true,
      closeButtonText: `閉じる`,
      buttons: [
        {
          side: 'start',
          icon: payload.notification.icon,
          handler: () => {
            console.log(payload);
            // if (payload.url){
            //   _self.router.navigateByUrl(payload.url);
            // }
          }
        }
      ]
    });
    toast.present();
  }

  checkLoginStatus() {
    // old version
    // return this.userData.isLoggedIn().then(loggedIn => {
    //   return this.updateLoggedInStatus(loggedIn);
    // });
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        return this.updateLoggedInStatus(true);
      } else {
        return this.updateLoggedInStatus(false);
      }
    });
  }

  updateLoggedInStatus(loggedIn: boolean) {
    setTimeout(() => {
      this.loggedIn = loggedIn;
    }, 300);
  }

  listenForLoginEvents() {
    this.events.subscribe('user:login', () => {
      this.updateLoggedInStatus(true);
    });

    this.events.subscribe('user:signup', () => {
      this.updateLoggedInStatus(true);
    });

    this.events.subscribe('user:logout', () => {
      this.updateLoggedInStatus(false);
    });
  }

  async logout() {
    // old version
    // this.userData.logout().then(() => {
    //   return this.router.navigateByUrl('/app/tabs/schedule');
    // });
    await firebase.auth().signOut();
    await this.events.publish('user:logout');
    const alert = await this.alertController.create({
      header: '確認',
      message: 'ログアウトしました。',
      buttons: ['OK']
    });
    await alert.present();
    this.router.navigateByUrl('/login');
  }

  openTutorial() {
    this.menu.enable(false);
    this.storage.set('ion_did_tutorial', false);
    this.router.navigateByUrl('/tutorial');
  }
}
