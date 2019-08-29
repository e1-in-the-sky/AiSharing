import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReservationCardComponent } from '../../components/reservation-card/reservation-card.component';
import { UserChipComponent } from '../../components/user-chip/user-chip.component';
import { Timestamp2stringPipe } from '../../pipes/timestamp2string/timestamp2string.pipe';
import { ReservationPostPage } from '../../pages/reservation-post/reservation-post.page';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ReservationCardComponent,
    UserChipComponent,
    Timestamp2stringPipe,
    ReservationPostPage
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  exports: [
    ReservationCardComponent,
    UserChipComponent
  ],
  entryComponents: [
    ReservationPostPage
  ]
})
export class AppCommonModule { }
