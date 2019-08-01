import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReservationCardComponent } from '../../components/reservation-card/reservation-card.component';

@NgModule({
  declarations: [
    ReservationCardComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    ReservationCardComponent
  ]
})
export class AppCommonModule { }
