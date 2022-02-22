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
  }

  powerUpsGame() {
    this.gameService.joinPowerUpQueue();
  }

  startTimer() {
    // let queueInterval = setInterval(() => this.queueCounter++, 1000);
  }

  cancelQueue() {
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
}
