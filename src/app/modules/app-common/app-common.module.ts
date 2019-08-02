import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReservationCardComponent } from '../../components/reservation-card/reservation-card.component';
import { UserChipComponent } from '../../components/user-chip/user-chip.component';

@NgModule({
  declarations: [
    ReservationCardComponent,
    UserChipComponent
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
