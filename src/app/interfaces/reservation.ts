import { DocumentReference } from '@angular/fire/firestore';
import * as firebase from 'firebase';

export interface Reservation {
    owner: DocumentReference,
    departure_name: string,
    destination_name: string,
    departure_point: firebase.firestore.GeoPoint,
    destination_point: firebase.firestore.GeoPoint,
    departure_time: Date,
    user_num: number,
    condition: number,
    comment: string,
    createdAt: Date,
    updatedAt: Date
}
