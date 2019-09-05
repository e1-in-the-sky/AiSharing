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


@NgModule({
  declarations: [
    ReservationCardComponent,
    UserChipComponent,
    Timestamp2stringPipe,
    ReservationPostPage,
    ReservationEditPage,
    ReservationFilterPage,
    MypageEditPage
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
  ],
  entryComponents: [
    ReservationPostPage,
    ReservationEditPage,
    ReservationFilterPage,
    MypageEditPage
  ],
  providers: [
    YahooService
  ]
})
export class AppCommonModule { }
