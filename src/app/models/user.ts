export class User {
    constructor(
        public uid: string,
        public email: string,
        public password: string,
        public name: string,
        public icon: string,
        public message: string,
        public reservations: string[] = [],
    ) {}
}
