import { DocumentReference } from '@angular/fire/firestore';

export interface Message {
    account: DocumentReference,
    reservation: DocumentReference,
    message: string,
    createdAt: Date,
    updatedAt: Date
}
