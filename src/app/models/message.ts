export class Message {
    public uid: string = '';
    public message: string = '';
    public user: firebase.firestore.DocumentReference;
    public reservation: firebase.firestore.DocumentReference;
    public created_at: Date = new Date();
    public updated_at: Date = new Date();

    constructor(
        init?: Partial<Message>
    ) {
        Object.assign(this, init);
    }

    deserialize() {
        var deserialized_this = Object.assign({}, this);
        return deserialized_this;
    }
}
