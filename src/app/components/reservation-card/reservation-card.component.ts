import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as firebase from 'firebase';
import { Router } from '@angular/router';
import { Reservation } from '../../models/reservation';
import { User } from '../../models/user';
import { AlertController, NavController, LoadingController } from '@ionic/angular';
import { ReservationUsers } from '../../models/reservation-users';
import { AngularFirestore } from '@angular/fire/firestore';
import { ReservationUsersService } from '../../services/reservation_users/reservation-users.service';
import { ReservationService } from '../../services/reservation/reservation.service';
import { AbstractControl } from '@angular/forms'
import { controlNameBinding } from '@angular/forms/src/directives/reactive_directives/form_control_name';
import { UserService } from '../../services/user/user.service';
import { Message } from '../../models/message';
import { MessageService } from '../../services/message/message.service';

@Component({
  selector: 'reservation-card',
  templateUrl: './reservation-card.component.html',
  styleUrls: ['./reservation-card.component.scss'],
})
export class ReservationCardComponent implements OnInit, OnChanges {
  @Input()
  reservation: Reservation;
  user: User = new User();  // reservationのオーナー
  // user: User = new User();  // reservationのオーナー
  errors = {
    alreadyDeparted: false
  }

  unsubscribeReservation: any;

  @Input()
  isShowNorimasu: boolean = false;
  isShowDistance: boolean = false;
  isShowTime: boolean = false;
  
  constructor(
    private db: AngularFirestore,
    public router: Router,
    private navController: NavController,
    public alertController: AlertController,
    private loadingCtrl: LoadingController,
    private userService: UserService,
    private messageService: MessageService,
    private reservationService: ReservationService,
    private reservationUsersService: ReservationUsersService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    this.errors.alreadyDeparted = false;
    this.checkAlredyDeparted();
    if (this.reservation.owner){
      this.reservation.owner.get().then(doc => {this.user = new User(doc.data())});
    }
    console.log('changes:', changes);
    if (changes.reservation.currentValue.uid !== "") {
      console.log('reservation ngOnChanges:', this.reservation);
      this.onSnapshotReservation(changes.reservation.currentValue.uid);
    }
  }

  ngOnInit() {
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave');
    // this.unsubscribeReservation();
  }

  getCurrentUser(): firebase.User | Promise<firebase.User> {
    return new Promise((resolve, reject) => {
      firebase.auth().onAuthStateChanged((user: firebase.User) => {
        if (user) {
          resolve(user);
        } else {
          console.log('User is not logged in');
          // resolve(false);
          reject();
        }
      });
    });
  }

  checkAlredyDeparted() {
    let departure_time = this.reservation.departure_time;
    if (departure_time instanceof firebase.firestore.Timestamp) {
      departure_time = departure_time.toDate();
    }
    if (departure_time < new Date()){
      this.errors.alreadyDeparted = true;
    }
  }

  goToReservationDetail() {
    // for reservation detail page
    // console.log(reservation);
    // console.log(reservation.owner);
    // this.router.navigateByUrl('/app/tabs/reservations/detail/' + this.reservation.uid);
    this.navController.navigateForward('/app/tabs/reservations/detail/' + this.reservation.uid);
  }

  async onSnapshotReservation(uid) {
    console.log('reservation:', this.reservation);
    var reservationRef = await this.db.collection('reservations').doc(uid).ref;
    reservationRef.onSnapshot(doc => {
      console.log('on change reservation document:', uid);
      this.reservation = new Reservation(doc.data());
    });
  }

  async goToAccountDetail(e: any) {
    e.stopPropagation();
    console.log("goToAccountDetailをクリック")
    // for account detail page
    var account_uid = this.reservation.owner.id;
    var path = '/app/tabs/account/' + account_uid;
    await firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // account_uidが自分だった場合はマイページに移動
        if (user.uid == account_uid) {
          path = '/app/tabs/mypage';
        }
      }
    });
    this.router.navigateByUrl(path);
  }

  // async displayNorimasuAlert() {
  //   console.log('on ノリマス');
  //   var my_reservation = false;
  //   var myUserRef;

  //   await firebase.auth().onAuthStateChanged(user => {
  //     if (user) {
  //       myUserRef = this.db.collection('users').doc(user.uid).ref;
  //       if (user.uid == this.reservation.owner.id) { 
  //         // 自分の投稿だった場合
  //         my_reservation = true;
  //       }
  //     }
  //   });

  //   if (my_reservation) {
  //     // 自分の投稿だった場合
  //     const alert = await this.alertController.create({
  //       header: 'これは自分の投稿です！',
  //       // subHeader: 'Subtitle',
  //       message: 'This is my reservation.',
  //       buttons: ['OK']
  //     });
  //     await alert.present();
  //   } else {
  //     // 自分の投稿じゃない場合
  //     let alert = await this.alertController.create({
  //       header: '相乗り予約',
  //       message:'1',
  //       cssClass: 'alert_norimasu',
  //       inputs: [
  //         {
  //           name: 'comment',
  //           type: 'text',
  //           placeholder: 'コメント',
  //           value: 'よろしくお願いします。',
  //         }
  //       ],
  //       buttons: [
  //         {
  //           text: "+",
  //           handler: () => {
  //             let num = Math.min(parseInt(alert.message) + 1,
  //               this.reservation.max_passenger_count - this.reservation.passenger_count);
  //             alert.message = num.toString();
  //             return false;
  //           }
  //         },
  //         {
  //           text: "-",
  //           handler: () => {
  //             let num = Math.max(parseInt(alert.message) - 1, 1);
  //             alert.message = num.toString();
  //             return false;
  //           }
  //         },
  //          {
  //           text: 'ノリマス！',
  //           handler: data => {
  //             console.log('Confirm Ok');
  //             console.log('on ノリマス:', data);
  //             console.log('reservation:', this.reservation);
  //             data.passenger_count = alert.message;
  //             this.onNorimasu(myUserRef, data).then(() => {}, error => {console.log(error)});
  //           }
  //         },
  //         {
  //           text: 'Cancel',
  //           role: 'cancel',
  //           cssClass: 'secondary',
  //           handler: () => {
  //             console.log('Confirm Cancel');
  //           }
  //         },
  //       ]
  //     });
  //     await alert.present();
  //   }
  // }

  async displayNorimasuAlert() {
    console.log('on ノリマス');
    
    var loading = await this.createLoading();
    loading.present();

    // カレントユーザーの取得
    var firebaseUser = await this.getCurrentUser();
    var currentUser = await this.userService.getUser(firebaseUser.uid);

    // すでにノリマスを押した人の一覧にカレントユーザーがいないか確認
    var reservationUsers: ReservationUsers[] = await this.reservationUsersService.getReservationUsersByReservationUid(this.reservation.uid);
    var indexOfAlredyNorimasu: number = reservationUsers.findIndex(reservationUser => reservationUser.user.id === currentUser.uid);

    loading.dismiss();

    console.log(indexOfAlredyNorimasu);
    if (indexOfAlredyNorimasu === -1) {  // まだノリマスを押していないとき
      // 相乗り予約のアラート
      var alert = await this.createPostAlert(currentUser.uid);
      await alert.present();
      
    } else {  // すでにノリマスを押していたとき
      // 乗車人数を変更するか確認のアラートを表示
      let alertConfirm = await this.alertController.create({
        header: '確認',
        message: 'すでに乗車予定です。乗車人数を変更しますか？',
        buttons: [
          {
            text: 'いいえ',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'はい',
            handler: async () => {
              // 乗車人数を変更するアラート
              var alert = await this.createUpdateReservationUser(reservationUsers[indexOfAlredyNorimasu], currentUser.uid);
              alert.present();
            }
          }
        ]
      });
      alertConfirm.present();
      
    }

  }

  async createPostAlert(currentUserUid: string){
    let alert = await this.alertController.create({
      header: '相乗り予約',
      message:'1',
      cssClass: 'alert_norimasu',
      inputs: [
        {
          name: 'comment',
          type: 'text',
          placeholder: 'コメント',
          value: 'よろしくお願いします。',
        }
      ],
      buttons: [
        {
          text: "+",
          handler: () => {
            let num = Math.min(parseInt(alert.message) + 1,
              this.reservation.max_passenger_count - this.reservation.passenger_count);
            alert.message = num.toString();
            return false;
          }
        },
        {
          text: "-",
          handler: () => {
            let num = Math.max(parseInt(alert.message) - 1, 1);
            alert.message = num.toString();
            return false;
          }
        },
        {
        text: 'ノリマス！',
        handler: async data => {
          console.log('Confirm Ok');
          console.log('on ノリマス:', data);
          console.log('reservation:', this.reservation);
          var userRef = await this.db.collection('users').doc(currentUserUid).ref;
          var reservationRef = await this.db.collection('reservations').doc(this.reservation.uid).ref 
          
          if (data.comment){
            console.log('data.comment in if(data.comment):', data.comment);
            // メッセージの作成
            var message: Message
              = new Message({
                created_at: new Date(),
                updated_at: new Date(),
                uid: '',
                user: userRef,
                reservation: reservationRef,
                message: data.comment
              });
            // メッセージの送信
            this.messageService.addMessage(message);
          }

          // reservationUserの作成
          var reservationUsers: ReservationUsers
            = new ReservationUsers({
              user: userRef,
              reservation: reservationRef,
              passenger_count: parseInt(alert.message)
            });
          // reservationUserのチェックと送信
          this.onNorimasu(reservationUsers).then(() => {}, error => {console.log(error)});
        }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        },
      ]
    });
    return alert;
  }

  async createUpdateReservationUser(reservationUser: ReservationUsers, currentUserUid: string) {
    let alert = await this.alertController.create({
      header: '相乗り予約',
      message: reservationUser.passenger_count.toString(),
      cssClass: 'alert_norimasu',
      inputs: [
        {
          name: 'comment',
          type: 'text',
          placeholder: 'メッセージ',
          // value: '',
        }
      ],
      buttons: [
        {
          text: "+",
          handler: () => {
            let num = Math.min(parseInt(alert.message) + 1,
              this.reservation.max_passenger_count - this.reservation.passenger_count + reservationUser.passenger_count);
            alert.message = num.toString();
            return false;
          }
        },
        {
          text: "-",
          handler: () => {
            let num = Math.max(parseInt(alert.message) - 1, 1);
            alert.message = num.toString();
            return false;
          }
        },
        {
        text: '修正',
        handler: async data => {
          console.log('Confirm Ok');
          console.log('on ノリマス:', data);
          console.log('reservation:', this.reservation);
          // reservationUser.passenger_count = parseInt(alert.message);
          // var myUserRef = await this.db.collection('users').doc(currentUserUid).ref
          // this.onNorimasu(myUserRef, data).then(() => {}, error => {console.log(error)});
          var userRef = await this.db.collection('users').doc(currentUserUid).ref;
          var reservationRef = await this.db.collection('reservations').doc(this.reservation.uid).ref 
          
          if (data.comment){
            console.log('data.comment in if(data.comment):', data.comment);
            // メッセージの作成
            var message: Message
              = new Message({
                created_at: new Date(),
                updated_at: new Date(),
                uid: '',
                user: userRef,
                reservation: reservationRef,
                message: data.comment
              });
            // メッセージの送信
            this.messageService.addMessage(message);
          }
          this.onUpdateNorimasu(reservationUser, parseInt(alert.message));
        }
        },
        {
          text: 'キャンセル',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        },
      ]
    });
    return alert;
  }

  // async sendMessage(message: Message){

  // }

  async onNorimasu(reservationUsers: ReservationUsers) {
    console.log(this.reservation.passenger_count);
    console.log(this.reservation.max_passenger_count);
    // max_passenger_countを超えたら失敗
    if (this.reservation.passenger_count + reservationUsers.passenger_count > this.reservation.max_passenger_count) {
      // passenger_countがmax_passenger_countを超えたら追加失敗
      const alert = await this.alertController.create({
        header: '最大乗車人数を超えてしまいます！',
        // subHeader: 'Subtitle',
        message: 'max passenger error!',
        buttons: ['OK']
      });
      await alert.present();
      throw new Error('max passenger error');
    }

    // reservationのpassenger_countの追加
    this.reservation.passenger_count += reservationUsers.passenger_count;
    this.reservationService.updateReservation(this.reservation.uid, this.reservation)
      .then(() => {
        // reservationの更新に成功したらreservationUsersを追加
        this.reservationUsersService.addReservationUsers(reservationUsers)
          .then(() => {
            console.log('add reservation user is successful');
            this.router.navigateByUrl('/app/tabs/reservations/detail/' + this.reservation.uid);
          })
      });
  }

  async onUpdateNorimasu(reservationUser: ReservationUsers, newPassengerCount: number) {
    this.reservation.passenger_count -= reservationUser.passenger_count;
    try {
      
      // max_passenger_countを超えたら失敗
      if (this.reservation.passenger_count + newPassengerCount > this.reservation.max_passenger_count) {
        // passenger_countがmax_passenger_countを超えたら追加失敗
        const alert = await this.alertController.create({
          header: '最大乗車人数を超えてしまいます！',
          // subHeader: 'Subtitle',
          message: 'max passenger error!',
          buttons: ['OK']
        });
        await alert.present();
        throw new Error('max passenger error');
      }

      this.reservation.passenger_count += newPassengerCount;
      reservationUser.passenger_count = newPassengerCount;

      // reservationの更新
      await this.reservationService.updateReservation(this.reservation.uid, this.reservation);

      // reservationUserの更新
      await this.reservationUsersService.updateReservationUsers(reservationUser.uid, reservationUser);
      console.log('update reservation user is successful');
      this.router.navigateByUrl('/app/tabs/reservations/detail/' + this.reservation.uid);
      

    } catch (err) {
      this.reservation.passenger_count += reservationUser.passenger_count;
      var errorAlert = await this.createError(err);
      errorAlert.present();
    }
  }

  async createLoading() {
    let loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: '読み込み中...'
    });
    return loading;
  }

  async createError(err) {
    let alert = await this.alertController.create({
      header: 'エラー',
      // subHeader: 'Subtitle',
      message: err,
      buttons: ['OK']
    });
    return alert;
  }

}
