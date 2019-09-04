import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TaxiReservationPage } from './taxi-reservation.page';

const routes: Routes = [
  {
    path: '',
    component: TaxiReservationPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TaxiReservationPage]
})
export class TaxiReservationPageModule {}
