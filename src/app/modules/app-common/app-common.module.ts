import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReservationCardComponent } from '../../components/reservation-card/reservation-card.component';
import { UserChipComponent } from '../../components/user-chip/user-chip.component';
import { Timestamp2stringPipe } from '../../pipes/timestamp2string/timestamp2string.pipe';


@NgModule({
  declarations: [
    ReservationCardComponent,
    UserChipComponent,
    Timestamp2stringPipe
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    ReservationCardComponent,
    UserChipComponent
  ]
})
export class AppCommonModule { }
