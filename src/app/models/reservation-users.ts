export class ReservationUsers {
    // users: {
    //     passenger_count: number,
    //     user: firebase.firestore.DocumentReference
    // }[];
    uid: string = '';
    reservation: firebase.firestore.DocumentReference;
    user: firebase.firestore.DocumentReference;
    passenger_count: number = 1;
    constructor(
        init?: Partial<ReservationUsers>
    ) {
        Object.assign(this, init);
    }

    deserialize() {
        return Object.assign({},this);
    }
}
