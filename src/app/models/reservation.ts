import { User } from './user';
import { Message } from './message';

import * as firebase from 'firebase';

export class Reservation {
    // public owner: User;
    // public departure: string;
    // public destination: string;
    // public departure_time: string;
    // public passengerCount: number;
    // public condition: string;
    // public message: string;
    // public chats: Message[];
    // public published_time: string;

    public uid: string = '';
    public owner: firebase.firestore.DocumentReference;
    public departure_name: string = '';
    public departure_point: firebase.firestore.GeoPoint = new firebase.firestore.GeoPoint(0, 0);
    public departure_time: firebase.firestore.Timestamp | Date = new firebase.firestore.Timestamp(0, 0);
    // public departure_time: Date;
    public destination_name: string = '';
    public destination_point: firebase.firestore.GeoPoint = new firebase.firestore.GeoPoint(0, 0);
    public passenger_count: number = 1;
    public max_passenger_count: number = 4;

    public onlywoman: boolean = false;
    public bigluggage: boolean = false;

    public total_distance: number = 0;  // 移動距離(m)
    public total_time: number = 0;  // 移動時間(s)
    public fare: number = 0;  // 運賃(円)

    public condition: string = '募集中';
    public comment: string = 'よろしくお願いします。';
    public readonly created_at: firebase.firestore.Timestamp | Date = new firebase.firestore.Timestamp(0, 0);
    // public readonly created_at: Date;
    public updated_at: firebase.firestore.Timestamp | Date = new firebase.firestore.Timestamp(0, 0);
    // public updated_at: Date;

    constructor(
        init?: Partial<Reservation>
        // public owner: User,
        // public departure: string,
        // public destination: string,
        // public departure_time: string,
        // public reservation_num: number,
        // public condition: string,
        // public message: string,
        // public chats: Message[],
        // public published_time: string
    ) {
        Object.assign(this, init);
    }

    deserialize() {
        var deserialized_this  = Object.assign({}, this);
        // deserialized_this.owner = deserialized_this.owner.deserialize();
        return deserialized_this;
    }
}
