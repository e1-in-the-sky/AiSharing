import { Component, OnInit, Input } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'map-reservations',
  templateUrl: './map-reservations.page.html',
  styleUrls: ['./map-reservations.page.scss'],
})
export class MapReservationsPage implements OnInit {
  @Input() reservations;
  @Input() center;

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams
  ) { }

  ngOnInit() {
    this.reservations = this.navParams.get('reservations');
    this.center = this.navParams.get('center');
    // console.log('before sorting:', this.reservations);
    // 並び替える
    // var dist = this.calcDistanceBetween(this.center, this.reservations[0].departure_point);
    // console.log(dist);
    this.sortReservationsByCenterPosition();
    // console.log('after sorring:', this.reservations);
  }

  onCancel() {
    console.log('on cancel');
    this.dismissModal(null);
  }

  dismissModal(data) {
    this.modalCtrl.dismiss(data);
    // this.modalCtrl.dismiss(this.dataForDismiss);
  }

  sortReservationsByCenterPosition() {
    // console.log('start sort');
    this.reservations = this.reservations.sort((a, b) => {
      // console.log('sorting');
      return this.calcDistanceBetween(this.center, a.departure_point) > this.calcDistanceBetween(this.center, b.departure_point) ? 1 : -1;
    });
    // console.log('end sort');
  }

  calcDistanceBetween(center, point){
    // console.log('center:', center);
    // console.log('point:', point);
    return Math.sqrt((point.latitude - center.lat) ** 2 + (point.longitude - center.lng) ** 2);
  }

}
