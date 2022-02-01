import { Pipe, PipeTransform } from '@angular/core';
import {DatePipe} from "@angular/common";

@Pipe({
  name: 'gameLength'
})
export class GameLengthPipe implements PipeTransform {


  transform(value: number): unknown {
    const date = new Date(value);

    // let seconds = date.getSeconds();
    // if (seconds < 10) {
    //   return `${Math.floor(value / 60000)}:0${seconds}`;
    // } else {
    //   return `${Math.floor(value / 60000)}:${seconds}`;
    // }
    if (date.getHours()) {
      return `${date.getHours()}h ${date.getMinutes()}m ${date.getSeconds()}s`;
    } else {
      return `${date.getMinutes()}m ${date.getSeconds()}s`;
    }
  }

}
