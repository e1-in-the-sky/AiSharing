import { User } from './user';
import { Message } from './message';

export class Reservation {
    public owner: User;
    public departure: string;
    public destination: string;
    public departure_time: string;
    public passengerCount: number;
    public condition: string;
    public message: string;
    public chats: Message[];
    public published_time: string;

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
        deserialized_this.owner = deserialized_this.owner.deserialize();
        return deserialized_this;
    }
}
