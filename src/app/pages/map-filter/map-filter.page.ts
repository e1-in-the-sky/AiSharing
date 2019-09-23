import { Component, OnInit, Input } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'map-filter',
  templateUrl: './map-filter.page.html',
  styleUrls: ['./map-filter.page.scss'],
})
export class MapFilterPage implements OnInit {
  today = new Date();
  // dataForDismiss = {};
  departute_time_start_str = '';
  departure_time_end_str = '';
  departure_time_day: Date = new Date();
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

  addTime(ev){
    var daytime = this.departure_time_day;
    daytime.setHours(ev.slice(0,2));
    daytime.setMinutes(ev.slice(-2));
    console.log('daytime:', daytime);
    return daytime;
  }


  onSearch() {
    this.filter.departure_time_start.setFullYear(this.departure_time_day.getFullYear());
    this.filter.departure_time_start.setMonth(this.departure_time_day.getMonth());
    this.filter.departure_time_start.setDate(this.departure_time_day.getDate());
    this.filter.departure_time_end.setFullYear(this.departure_time_day.getFullYear());
    this.filter.departure_time_end.setMonth(this.departure_time_day.getMonth());
    this.filter.departure_time_end.setDate(this.departure_time_day.getDate());
    console.log(this.filter);
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
