import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import * as firebase from 'firebase';
import { UserService } from '../../services/user/user.service';
import { User } from '../../models/user';
import { ReservationService } from '../../services/reservation/reservation.service';
import { Reservation } from '../../models/reservation';
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { AccountIconService } from '../../services/account-icon/account-icon.service';
import { ReservationUsersService } from '../../services/reservation_users/reservation-users.service';
import { MypageEditPage } from '../mypage-edit/mypage-edit.page';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'route-search-list',
  templateUrl: './route-search-list.page.html',
  styleUrls: ['./route-search-list.page.scss'],
})
export class RouteSearchListPage implements OnInit {

  user: User = new User();
  reservations: Reservation[][];

  indexOfSelectedLocation = 0;
  route_list = null;
  selected_route = null;
  selected_reservations = null;

  slidesOpts = {
    slidesPerView: 3,
    coverflowEffect: {
      rotate: 50,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    },
    on: {
      beforeInit() {
        const swiper = this;
  
        swiper.classNames.push(`${swiper.params.containerModifierClass}coverflow`);
        swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
  
        swiper.params.watchSlidesProgress = true;
        swiper.originalParams.watchSlidesProgress = true;
      },
      setTranslate() {
        const swiper = this;
        const {
          width: swiperWidth, height: swiperHeight, slides, $wrapperEl, slidesSizesGrid, $
        } = swiper;
        const params = swiper.params.coverflowEffect;
        const isHorizontal = swiper.isHorizontal();
        const transform$$1 = swiper.translate;
        const center = isHorizontal ? -transform$$1 + (swiperWidth / 2) : -transform$$1 + (swiperHeight / 2);
        const rotate = isHorizontal ? params.rotate : -params.rotate;
        const translate = params.depth;
        // Each slide offset from center
        for (let i = 0, length = slides.length; i < length; i += 1) {
          const $slideEl = slides.eq(i);
          const slideSize = slidesSizesGrid[i];
          const slideOffset = $slideEl[0].swiperSlideOffset;
          const offsetMultiplier = ((center - slideOffset - (slideSize / 2)) / slideSize) * params.modifier;
  
           let rotateY = isHorizontal ? rotate * offsetMultiplier : 0;
          let rotateX = isHorizontal ? 0 : rotate * offsetMultiplier;
          // var rotateZ = 0
          let translateZ = -translate * Math.abs(offsetMultiplier);
  
           let translateY = isHorizontal ? 0 : params.stretch * (offsetMultiplier);
          let translateX = isHorizontal ? params.stretch * (offsetMultiplier) : 0;
  
           // Fix for ultra small values
          if (Math.abs(translateX) < 0.001) translateX = 0;
          if (Math.abs(translateY) < 0.001) translateY = 0;
          if (Math.abs(translateZ) < 0.001) translateZ = 0;
          if (Math.abs(rotateY) < 0.001) rotateY = 0;
          if (Math.abs(rotateX) < 0.001) rotateX = 0;
  
           const slideTransform = `translate3d(${translateX}px,${translateY}px,${translateZ}px)  rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  
           $slideEl.transform(slideTransform);
          $slideEl[0].style.zIndex = -Math.abs(Math.round(offsetMultiplier)) + 1;
          if (params.slideShadows) {
            // Set shadows
            let $shadowBeforeEl = isHorizontal ? $slideEl.find('.swiper-slide-shadow-left') : $slideEl.find('.swiper-slide-shadow-top');
            let $shadowAfterEl = isHorizontal ? $slideEl.find('.swiper-slide-shadow-right') : $slideEl.find('.swiper-slide-shadow-bottom');
            if ($shadowBeforeEl.length === 0) {
              $shadowBeforeEl = swiper.$(`<div class="swiper-slide-shadow-${isHorizontal ? 'left' : 'top'}"></div>`);
              $slideEl.append($shadowBeforeEl);
            }
            if ($shadowAfterEl.length === 0) {
              $shadowAfterEl = swiper.$(`<div class="swiper-slide-shadow-${isHorizontal ? 'right' : 'bottom'}"></div>`);
              $slideEl.append($shadowAfterEl);
            }
            if ($shadowBeforeEl.length) $shadowBeforeEl[0].style.opacity = offsetMultiplier > 0 ? offsetMultiplier : 0;
            if ($shadowAfterEl.length) $shadowAfterEl[0].style.opacity = (-offsetMultiplier) > 0 ? -offsetMultiplier : 0;
          }
        }
  
         // Set correct perspective for IE10
        if (swiper.support.pointerEvents || swiper.support.prefixedPointerEvents) {
          const ws = $wrapperEl[0].style;
          ws.perspectiveOrigin = `${center}px 50%`;
        }
      },
      setTransition(duration) {
        const swiper = this;
        swiper.slides
          .transition(duration)
          .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
          .transition(duration);
      }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    // private navParams: NavParams,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private userService: UserService,
    private reservationService: ReservationService,
    private reservationUsersService: ReservationUsersService
    ) { 
      // this.router.getCurrentNavigation().extrasはconstructorの中でやらないといけない
      // console.log('this.router.getCurrentNavigation()', this.router.getCurrentNavigation());
      // console.log('this.router.getCurrentNavigation().extras', this.router.getCurrentNavigation().extras);
      if (this.router.getCurrentNavigation().extras.state) {
        this.route_list = this.router.getCurrentNavigation().extras.state.routes;
      }
    }

  async ngOnInit() {
    // this.route_list = this.navParams.get("routes");
    // this.route.queryParams.subscribe(params => {
    //   console.log('this.router.getCurrentNavigation().extras', this.router.getCurrentNavigation().extras);
    //   if (this.router.getCurrentNavigation().extras.state) {
    //     this.route_list = this.router.getCurrentNavigation().extras.state.routes;
    //   }
    // });

    // await this.getExtras();

    this.route_list = this.route_list.responses;

    let loading = await this.createLoading();
    loading.present();
    // await this.getCurrentUser();
    try {
      // var firebaseUser = await this.getCurrentUser();
      // this.user = await this.userService.getUser(firebaseUser.uid);
      this.getReservations();
      loading.dismiss();
    } catch (err) {
      loading.dismiss();
      let alert = await this.createError(err);
      await alert.present();
      console.error(err);
    }

    // await this.selectLocation();
  }

  // async getExtras():Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.route.queryParams.subscribe(params => {
  //       // console.log('this.router.getCurrentNavigation().extras', this.router.getCurrentNavigation().extras);
  //       if (this.router.getCurrentNavigation().extras.state) {
  //         this.route_list = this.router.getCurrentNavigation().extras.state.routes;
  //       }
  //     }, error => {console.log('error:', error)});
  //   });
  // }

  async selectLocation(){
    this.selected_route = this.route_list[this.indexOfSelectedLocation];
    this.selected_reservations = [];
    for(var i in this.selected_route.logs){
      var log_reserve = this.selected_route.logs[i];
      console.log("log_reserve:", log_reserve);
      var reserve = await this.reservationService.getReservation(log_reserve.uid);
      console.log("reserve:", reserve);
      this.selected_reservations.push(reserve);
    }
  }

  async getReservations() {
    this.reservations = [];
    for (var route_count in this.route_list) {
      this.reservations.push([]);
      for (var reservation_count in this.route_list[route_count].logs){
        var uid = this.route_list[route_count].logs[reservation_count].uid;
        var reserve = await this.reservationService.getReservation(uid);
        this.reservations[route_count].push(reserve);
      }
    }
  }

  async createLoading() {
    let loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: '読み込み中...'
    });
    return loading;
  }

  // async getCurrentUser_() {
  //   // get current user information from firestore.
  //   await firebase.auth().onAuthStateChanged(async user => {
  //     if (user) {
  //       // User is signed in.
  //       this.user = await this.userService.getUser(user.uid);
  //     } else {
  //       // ログインしていないとき
  //     }
  //   });
  // }

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

  async createError(err) {
    const alert = await this.alertController.create({
      header: 'エラーが発生しました',
      // subHeader: 'Subtitle',
      // message: err,
      buttons: ['OK']
    });
    return alert;
  }

  onCancel() {
    console.log('on cancel');
    // this.dismissModal(null);
    this.navCtrl.navigateBack('/app/tabs/route-search');
  }

  dismissModal(data) {
    this.modalCtrl.dismiss(data);
    // this.modalCtrl.dismiss(this.dataForDismiss);
  }
}
