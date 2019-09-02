import { Component, OnInit, Input } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'reservation-filter',
  templateUrl: './reservation-filter.page.html',
  styleUrls: ['./reservation-filter.page.scss'],
})
export class ReservationFilterPage implements OnInit {
  today = new Date();
  // dataForDismiss = {};
  departute_time_start_str = '';
  departure_time_end_str = '';
  @Input() filter;

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams
  ) { }

  ngOnInit() {
    this.filter = this.navParams.get('filter');
  }

  onCancel() {
    console.log('on cancel');
    this.dismissModal();
  }

  dismissModal() {
    this.modalCtrl.dismiss({
      filter: this.filter
    });
    // this.modalCtrl.dismiss(this.dataForDismiss);
  }

  toDate(ev) {
    return new Date(ev);
  }

  onSearch() {
    // console.log(this.filter);
    this.dismissModal();
  }

}
