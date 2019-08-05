import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { AccountPage } from './account';
import { AccountPageRoutingModule } from './account-routing.module';
import { AppCommonModule } from '../../modules/app-common/app-common.module';

@NgModule({
  imports: [
    AppCommonModule,
    CommonModule,
    IonicModule,
    AccountPageRoutingModule
  ],
  declarations: [
    AccountPage,
  ]
})
export class AccountModule { }
