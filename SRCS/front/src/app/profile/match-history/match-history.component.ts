import {Component, Input, OnInit} from '@angular/core';
import {MatchHistory} from "../model/match-history.model";
import {User} from "../../shared/user";

@Component({
  selector: 'app-match-history',
  templateUrl: './match-history.component.html',
  styleUrls: ['./match-history.component.scss']
})
export class MatchHistoryComponent implements OnInit {

  @Input() user: User;
  @Input('matchHistory') matchHistory: MatchHistory;

  // firstPlayer: User;
  constructor() { }

  ngOnInit(): void {
  }

  isVictory() {
    return this.user.uid === this.matchHistory.winner;
  }

}
