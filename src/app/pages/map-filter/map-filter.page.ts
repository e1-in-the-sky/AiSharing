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
