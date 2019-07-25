import { User } from './user';

export class Message {
    public message: string;
    public user: User;
    public time: string;

    constructor(
        init?: Partial<Message>
    ) {
        Object.assign(this, init);
    }

    deserialize() {
        var deserialized_this = Object.assign({}, this);
        deserialized_this.user = deserialized_this.user.deserialize();
        return deserialized_this;
    }
}
