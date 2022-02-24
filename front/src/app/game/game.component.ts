import {Component, OnInit} from "@angular/core";
import {MainSocket} from "../socket/MainSocket";
import {GameService, GameStat} from "./game.service";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-game',
  templateUrl: 'game.component.html',
  styleUrls: ['game.component.scss']
})
export class GameComponent implements OnInit {

  gameStarting: boolean = false;
  queueCounter: number = 0;
  private queueInterval: any;

  constructor(private socket: MainSocket, public gameService: GameService, private http: HttpClient) {

  }

  ngOnInit() {
  }

  normalGame() {
    this.gameService.joinNormalQueue();
    this.startTimer();
  }

  powerUpsGame() {
    this.gameService.joinPowerUpQueue();
    this.startTimer();
  }

  startTimer() {
    this.queueCounter = 0;
    this.queueInterval = setInterval(() => this.queueCounter++, 1000);
  }

  cancelQueue() {
    clearInterval(this.queueInterval);
    this.gameService.leaveQueue();
  }

  showLiveGames() {
    this.gameService.getLiveGames();
  }

  watchGame(game: { GameId: string }) {
    this.gameService.watchGame(game.GameId);
  }

  backToMain() {
    this.gameService.stat = GameStat.MAIN;
  }

  getQueueTimer() {
    let sec: number | string = this.queueCounter % 60;
    let min: number | string = Math.floor(this.queueCounter / 60);
    sec = sec < 10 ? `0${sec}` : sec;
    min = min < 10 ? `0${min}` : min;
    return `${min}:${sec}`;
  }
}
