import { User } from './user';
import { Message } from './message';

export class Reservation {
    constructor(
        public owner: User,
        public departure: string,
        public destination: string,
        public departure_time: string,
        public reservation_num: number,
        public condition: string,
        public message: string,
        public chats: Message[],
        public published_time: string
    ) {}
}
