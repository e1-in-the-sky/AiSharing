export class ReservationUsers {
    users: {
        passenger_count: number,
        user: firebase.firestore.DocumentReference
    }[];
    constructor(
        init?: Partial<ReservationUsers>
    ) {
        Object.assign(this, init);
    }
}
