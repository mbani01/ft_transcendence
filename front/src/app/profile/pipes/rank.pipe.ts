import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rank'
})
export class RankPipe implements PipeTransform {

  transform(value: number): string {
    if (value >= 1200) {
      return 'Diamond';
    } else if (value >= 800) {
      return 'Gold';
    } else if (value >= 400) {
      return 'Silver';
    } else {
      return 'Bronze';
    }
  }

}
