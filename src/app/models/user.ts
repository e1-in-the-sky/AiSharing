export class User {
    public readonly uid: string = '';
    public name: string = '';
    public imageURL: string = '';
    public introduction: string = '';
    public readonly createdAt: Date = new Date();
    public updatedAt: Date = new Date();

    constructor(
        init?: Partial<User>

        // public uid: string,
        // public email: string,
        // public password: string,
        // public name: string,
        // public icon: string,
        // public message: string,
        // public reservations: string[] = [],

        // public uid: string,
        // public name: string,
        // public imageURL: string,
        // public introduction: string,
        // public createdAt: Date,
        // public updatedAt: Date
    ) {
        Object.assign(this, init);
    }

    deserialize() {
        return Object.assign({},this);
    }
}
