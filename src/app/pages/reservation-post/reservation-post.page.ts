import { Component, OnInit, ModuleWithComponentFactories } from '@angular/core';
import { Reservation } from '../../models/reservation';

import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';
import { ReservationService } from '../../services/reservation/reservation.service';
import { NavController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Title } from '@angular/platform-browser';
import { DatePipe } from '@angular/common'

@Component({
  selector: 'reservation-post',
  templateUrl: './reservation-post.page.html',
  styleUrls: ['./reservation-post.page.scss'],
})
export class ReservationPostPage implements OnInit {
  data: {
    departure_name: string,
    destination_name: string,
    departure_point: firebase.firestore.GeoPoint,
    destination_point: firebase.firestore.GeoPoint,
    departure_time: string,
    max_passenger_count: number,
    passenger_count: number,
    comment: string,
    condition: string,
    created_at: Date | firebase.firestore.Timestamp,
    updated_at: Date | firebase.firestore.Timestamp
  } = {
      departure_name: '',
      destination_name: '',
      departure_point: new firebase.firestore.GeoPoint(0, 0),
      destination_point: new firebase.firestore.GeoPoint(0, 0),
      departure_time: '',
      max_passenger_count: 4,
      passenger_count: 1,
      comment: 'よろしくお願いします。',
      condition: '募集中',
      created_at: new Date(),
      updated_at: new Date()
    };

  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private router: Router,
    private db: AngularFirestore,
    private reservationService: ReservationService,
    public alertController: AlertController,
    public datepipe: DatePipe,
  ) { }

  today = new Date();
  next_year = new Date();
  min_date = "";
  max_date = "";

  ngOnInit() {
    this.min_date = this.datepipe.transform(this.today, "yyyy-MM-dd");
    this.next_year.setFullYear(this.next_year.getFullYear() + 1); 
    this.max_date = this.datepipe.transform(this.next_year, "yyyy-MM-dd");
  }

  async on_date_changed(){
    if(new Date(this.data.departure_time) < new Date()){
      const alert = await this.alertController.create({
        header:"現在時刻より前を出発時間にはできません",
        buttons:["OK"],
      });
      await alert.present();
    }
  }

  onPost() {
    //if destination or departure name is empty then don't work
    if (!this.data.destination_name || !this.data.departure_name) {
      this.alert_no_information();
      return;
    }
    else if (!this.data.departure_time) {
      this.alert_no_time();
      return;
    }
      // else if(new Date(this.data.departure_time) <= new Date(this.data.departure_time)){
      else if(new Date(this.data.departure_time) <= new Date()){
      this.alert_invalid_time();
      return;
    }

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // case signin
        // const newReservationId = this.db.createId();
        // var newReservationRef = this.db.collection('reservations').doc(newReservationId);

        var reservation: Reservation = new Reservation({
          uid: '',
          // owner: user.uid
          owner: this.db.collection('users').doc(user.uid).ref,
          departure_name: this.data.departure_name,
          destination_name: this.data.destination_name,
          departure_point: this.data.departure_point,
          destination_point: this.data.destination_point,
          departure_time: new Date(this.data.departure_time),
          max_passenger_count: this.data.max_passenger_count,
          passenger_count: this.data.passenger_count,
          comment: this.data.comment,
          condition: this.data.condition,
          created_at: new Date(),
          updated_at: new Date()
        });

        console.log(this.data);
        console.log('reservavtion:', reservation);
        // newReservationRef.set(reservation.deserialize());
        this.reservationService.addReservation(reservation).then(() => {
          // this.navCtrl.back();
          // this.navCtrl.navigateBack('/app/tabs/reservations');
          this.dismissModal(true);
          // this.router.navigateByUrl('/app/tabs/reservations');
        });
      } else {
        // case signout
      }
    });
    this.alert_complete_send();
  }

  clamp(x, min, max) {
    x = Math.max(x, min);
    x = Math.min(x, max);
    return x;
  }

  on_click_max_passenger(amount) {
    this.data.max_passenger_count = this.clamp(this.data.max_passenger_count + amount, 2, 100);
    this.data.passenger_count = this.clamp(this.data.passenger_count, 1, this.data.max_passenger_count - 1);
  }

  on_click_passenger(amount) {
    this.data.passenger_count = this.clamp(this.data.passenger_count + amount, 1, this.data.max_passenger_count - 1);
  }

  async alert_no_information() {
    const alert = await this.alertController.create({
      message: 'Please fill departure place and destination',
      buttons: ['OK']
    });
    await alert.present();
  }

  async alert_no_time() {
    const alert = await this.alertController.create({
      message: 'Please fill in departure time',
      buttons: ['OK']
    });
    await alert.present();
  }

  async alert_invalid_time(){
    const alert = await this.alertController.create({
      message: "Please fill valid departure time",
      buttons: ["OK"],
    });
    await alert.present();
  }

  async alert_complete_send() {
    const alert = await this.alertController.create({
      message: 'Complete posting',
      buttons: ['OK']
    });
    await alert.present();
  }

  dismissModal(isUpdate: boolean = false) {
    this.modalCtrl.dismiss({
      "isUpdate": isUpdate
    });
  }

}
