import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs-page';
import { SchedulePage } from '../schedule/schedule';


const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'schedule',
        children: [
          {
            path: '',
            component: SchedulePage,
          },
          {
            path: 'session/:sessionId',
            loadChildren: '../session-detail/session-detail.module#SessionDetailModule'
          }
        ]
      },
      {
        path: 'speakers',
        children: [
          {
            path: '',
            loadChildren: '../speaker-list/speaker-list.module#SpeakerListModule'
          },
          {
            path: 'session/:sessionId',
            loadChildren: '../session-detail/session-detail.module#SessionDetailModule'
          },
          {
            path: 'speaker-details/:speakerId',
            loadChildren: '../speaker-detail/speaker-detail.module#SpeakerDetailModule'
          }
        ]
      },
      {
        path: 'map',
        children: [
          {
            path: '',
            loadChildren: '../map/map.module#MapModule'
          },
          {
            path: 'filter',
            loadChildren: '../map-filter/map-filter.module#MapFilterPageModule'
          },
          {
            path: 'reservations',
            loadChildren: '../map-reservations/map-reservations.module#MapReservationsPageModule'
          }
        ]
      },
      {
        path: 'taxi-reservation',
        children: [
          {
            path: '',
            loadChildren: '../taxi-reservation/taxi-reservation.module#TaxiReservationPageModule'
          }
        ]
      },
      {
        path: 'reservation-post',
        children: [
          {
            path: '',
            loadChildren: '../reservation-post/reservation-post.module#ReservationPostPageModule'
          }
        ]
      },
      {
        path: 'about',
        children: [
          {
            path: '',
            loadChildren: '../about/about.module#AboutModule'
          }
        ]
      },
      {
        path: 'reservations',
        children: [
          {
            path: '',
            loadChildren: '../reservation-list/reservation-list.module#ReservationListPageModule'
          },
          {
            path: 'post',
            loadChildren: '../reservation-post/reservation-post.module#ReservationPostPageModule'
          },
          {
            path: 'detail/:reservationId',
            loadChildren: '../reservation-detail/reservation-detail.module#ReservationDetailPageModule'        
          },
          {
            path: 'edit/:reservationId',
            loadChildren: '../reservation-edit/reservation-edit.module#ReservationEditPageModule'
          }
        ]
      },
      // mypage
      {
        path: 'mypage',
        children: [
          {
            path: '',
            loadChildren: '../mypage/mypage.module#MypagePageModule'
          }
        ]
      },
      {
        path: 'account/:accountId',
        children: [
          {
            path: '',
            loadChildren: '../account/account.module#AccountModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/app/tabs/schedule',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }

