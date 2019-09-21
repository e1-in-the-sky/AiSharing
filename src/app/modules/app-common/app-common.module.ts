import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReservationCardComponent } from '../../components/reservation-card/reservation-card.component';
import { UserChipComponent } from '../../components/user-chip/user-chip.component';
import { Timestamp2stringPipe } from '../../pipes/timestamp2string/timestamp2string.pipe';
import { ReservationPostPage } from '../../pages/reservation-post/reservation-post.page';
import { FormsModule } from '@angular/forms';
import { MypageEditPage } from '../../pages/mypage-edit/mypage-edit.page';
import { ReservationEditPage } from '../../pages/reservation-edit/reservation-edit.page';
import { ReservationFilterPage } from '../../pages/reservation-filter/reservation-filter.page';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { YahooService } from '../../services/yahoo/yahoo.service';
import { MapFilterPage } from '../../pages/map-filter/map-filter.page';
import { MapReservationsPage } from '../../pages/map-reservations/map-reservations.page';
import { RouteSearchListPage } from '../../pages/route-search-list/route-search-list.page';


@NgModule({
  declarations: [
    ReservationCardComponent,
    UserChipComponent,
    Timestamp2stringPipe,
    ReservationPostPage,
    ReservationEditPage,
    ReservationFilterPage,
    MypageEditPage,
    MapFilterPage,
    MapReservationsPage,
    RouteSearchListPage,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    HttpClientModule,
    HttpClientJsonpModule
  ],
  exports: [
    ReservationCardComponent,
    UserChipComponent,
    Timestamp2stringPipe,
    MypageEditPage,
    ReservationPostPage,
    ReservationEditPage,
    ReservationFilterPage,
    MapFilterPage,
    MapReservationsPage,
    RouteSearchListPage,
  ],
  entryComponents: [
    ReservationPostPage,
    ReservationEditPage,
    ReservationFilterPage,
    MypageEditPage,
    MapFilterPage,
    MapReservationsPage,
    RouteSearchListPage,
  ],
  providers: [
    YahooService
  ]
})
export class AppCommonModule { }
