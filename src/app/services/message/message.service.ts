import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Message } from '../../models/message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private db: AngularFirestore
  ) { }

  getMessage(uid) {
    // get message from firestore by message uid.
  }

  async getReservationMessages(reservation_uid) {
    // get messages of Reservation's(reservation_uid) from firestore.
    console.log('getReservationMessages:\nreservation_uid:', reservation_uid);
    var reservation_ref = this.db.collection('reservations').doc(reservation_uid).ref;
    var messages_ref = this.db.collection('messages').ref;
    var messages: Message[] = [];
    await messages_ref
      .where('reservation', '==', reservation_ref)
      .get()
      .then(querysnapshot => {
        querysnapshot.forEach(doc => {
          messages.push(new Message(doc.data()));
        })
    });
    return messages;
  }

  async onSnapshotReservationMessage(reservation_uid) {
    console.log('getReservationMessages:\nreservation_uid:', reservation_uid);
    var reservation_ref = this.db.collection('reservations').doc(reservation_uid).ref;
    var messages_ref = this.db.collection('messages').ref;
    return messages_ref
      .where('reservation', '==', reservation_ref)
      .onSnapshot((querySnapShot) => {
        var messages: Message[] = [];
        querySnapShot.forEach(doc => {
          messages.push(new Message(doc.data()));
        });
        messages = messages.sort((a, b) => {
          return a.created_at > b.created_at ? 1 : -1;
        });
      });
  }
 
  async addMessage(message: Message) {
    // add message to firestore.
    console.log('addMessage:\nmessage:', message);
    if (message.uid == '') {
      const newMessageId = this.db.createId();
      message.uid = newMessageId;
    }
    var newMessageDoc = this.db.collection('messages').doc(message.uid);
    await newMessageDoc.set(message.deserialize());
  }

  updateMessage(uid, message) {
    // update message.
  }

  async deleteMessage(uid){
    // delete message by message uid.
    await this.db.collection('messages').doc(uid)
    .delete()
    .then(() => {
      console.log("Document successfully deleted!");
    }).catch(error => {
      console.error("Error removing document: ", error);
    });
  }

}
