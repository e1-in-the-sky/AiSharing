import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { RouteSearchListPage } from './route-search-list.page';
import { AppCommonModule } from '../../modules/app-common/app-common.module';

const routes: Routes = [
  {
    path: '',
    component: RouteSearchListPage
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
  //declarations: [RouteSearchListPage]
})
export class RouteSearchListPageModule {}
