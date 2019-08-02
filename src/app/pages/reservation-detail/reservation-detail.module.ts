import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ReservationDetailPage } from './reservation-detail.page';
import { AppCommonModule } from '../../modules/app-common/app-common.module';

const routes: Routes = [
  {
    path: '',
    component: ReservationDetailPage
  }
];

@NgModule({
  imports: [
    AppCommonModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ReservationDetailPage]
})
export class ReservationDetailPageModule {}
