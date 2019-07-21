import { User } from './user';

export class Message {
    constructor(
        public message: string,
        public user: User,
        public time: string
    ) {}
}
