import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MypagePage } from './mypage.page';
import { AppCommonModule } from '../../modules/app-common/app-common.module';

const routes: Routes = [
  {
    path: '',
    component: MypagePage
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
  declarations: [MypagePage]
})
export class MypagePageModule {}
