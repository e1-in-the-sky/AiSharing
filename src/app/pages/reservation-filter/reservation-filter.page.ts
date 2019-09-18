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
    this.dismissModal(null);
  }

  dismissModal(data) {
    this.modalCtrl.dismiss(data);
    // this.modalCtrl.dismiss(this.dataForDismiss);
  }

  toDate(ev) {
    return new Date(ev);
  }

  addTime(targetdate, ev){
    var daytime = new Date(targetdate)
    daytime.setHours(ev.slice(0,2))
    daytime.setMinutes(ev.slice(-2))
    return new Date(daytime);
  }


  onSearch() {
    // console.log(this.filter);
    this.dismissModal({
      filter: this.filter
    });
  }

  onClickPassengerCapacity(num) {
    var r = this.filter.passenger_capacity + num;
    if (r >= 0) {
      this.filter.passenger_capacity = r;
    }
  }

}
