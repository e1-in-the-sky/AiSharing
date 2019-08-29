import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timestamp2string'
})
export class Timestamp2stringPipe implements PipeTransform {

  transform(value: firebase.firestore.Timestamp, args?: any): any {
    // console.log('value:', value);
    // console.log('value.toDate():', value.toDate());
    var date = value.toDate();
    return toLocaleString(date);
  }

}

function toLocaleString( date )
{
    return [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
        ].join( '/' ) + ' '
        + date.toLocaleTimeString();
}
