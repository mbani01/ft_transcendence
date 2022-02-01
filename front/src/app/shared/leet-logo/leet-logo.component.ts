import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-leet-logo',
  templateUrl: './leet-logo.component.html',
})
export class LeetLogoComponent implements OnInit {

  @Input() size = 20;
  @Input() color = 'black';
  constructor() { }

  ngOnInit(): void {
  }

}
