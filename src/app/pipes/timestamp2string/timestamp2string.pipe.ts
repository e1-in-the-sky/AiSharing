import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timestamp2string'
})
export class Timestamp2stringPipe implements PipeTransform {

  transform(value: firebase.firestore.Timestamp, args?: any): any {
    // console.log('value:', value);
    // console.log('value.toDate():', value.toDate());
    var today = new Date();
    var date = value.toDate();
    // var date_str = [
    //   date.getFullYear(),
    //   date.getMonth() + 1,
    //   date.getDate()
    // ].join( '/' ) + ' '
    // + date.toLocaleTimeString();

    var date_str = [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    ].join( '/' );

    var today_str = [
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    ].join( '/' );

    if (date_str === today_str) {
      date_str = '本日';
    }

    var time_str = [
      ('0' + date.getHours().toString()).slice(-2),
      ('0' + date.getMinutes().toString()).slice(-2)
    ].join( ':' );

    return date_str + ' ' + time_str;
  }

}
