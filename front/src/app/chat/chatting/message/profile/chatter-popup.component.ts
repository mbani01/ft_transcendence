import {Component, Input, SimpleChange, ViewChild} from "@angular/core";
import {User} from "../../../../shared/user";
import {NgbPopover, NgbTimepicker, NgbTimepickerConfig} from "@ng-bootstrap/ng-bootstrap";
import {Router} from "@angular/router";

@Component({
  selector: 'chatter-popup',
  templateUrl: 'chatter-popup.component.html',
  styleUrls: ['chatter-popup.component.scss']
})
export class ChatterPopupComponent {
  @Input() user: User;
  @Input() popover: NgbPopover;
  constructor(private router: Router) {
  }

  // ngAfterViewInit() {
  //   let input = <HTMLInputElement>document.getElementsByClassName('ngb-tp-input').item(0);
  //   input.maxLength = 6;
  //   // @ts-ignore
  //   console.log(input.);// = (value) => {console.log(value)};
  // }

  mute(hours: string, minutes: string) {
    console.log('Mute: ')
    console.log(parseInt(hours) + ' ' + parseInt(minutes));
    this.popover.close();
  }

  ban() {

    this.popover.close();
  }

  viewProfile() {
    console.log(this.user);
    this.router.navigate(['profile', this.user.uid]);
    this.popover.close();

  }

  invitePlay() {

    this.popover.close();

  }

  giveAdmin() {

    this.popover.close();
  }

  validate(input: HTMLInputElement) {
    let value = parseInt(input.value);

    if (isNaN(value) || value <= 0) {
      input.value = '0';
    } else if (parseInt(input.value) > 999999) {
      input.value = '999999';
    }
  }

}
