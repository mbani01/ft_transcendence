import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-forty-two-logo',
  templateUrl: './forty-two-logo.component.html',
})
export class FortyTwoLogoComponent implements OnInit {

  @Input() size = 20;
  @Input() color = "white";
  constructor() { }

  ngOnInit(): void {
  }

}
