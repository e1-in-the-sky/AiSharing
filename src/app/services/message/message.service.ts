import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor() { }

  getMessage(uid) {
    // get message from firestore by message uid.
  }

  getReservationMessages(reservation_uid) {
    // get messages of Reservation's(reservation_uid) from firestore.
  }

  addMessage(message) {
    // add message to firestore.
  }

  updateMessage(uid, message) {
    // update message.
  }

  deleteMessage(uid){
    // delete message by message uid.
  }

}
