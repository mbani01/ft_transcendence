import {Component, Input, OnInit} from '@angular/core';
import {MatchHistory} from "../model/match-history.model";

@Component({
  selector: 'app-match-history',
  templateUrl: './match-history.component.html',
  styleUrls: ['./match-history.component.scss']
})
export class MatchHistoryComponent implements OnInit {

  @Input('matchHistory') matchHistory: MatchHistory;
  constructor() { }

  ngOnInit(): void {
  }

  isVictory() {
    return this.matchHistory.score1 > this.matchHistory.score2;
  }

}
