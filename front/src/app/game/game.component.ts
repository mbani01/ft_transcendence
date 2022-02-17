import {Component, OnInit} from "@angular/core";
import {MainSocket} from "../socket/MainSocket";

import {socketListening} from "./game";
import {GameService} from "./game.service";

@Component({
  selector: 'app-game',
  templateUrl: 'game.component.html',
  styleUrls: ['game.component.scss']
})
export class GameComponent implements OnInit {

  gameStarting: boolean = false;
  queueCounter: number = 0;

  constructor(private socket: MainSocket, public gameService: GameService) {
    // socket.on('gameStarted', g.gameStarted);
    // socket.emit('joinDefaultGame', { wsap: '1'});
    // socket.on("syncRound", g.syncRound);
    // socket.on('GameOver', g.gameOver);
    // socket.on('sync', g.sync);
    // socket.on('syncBall', g.syncBall);
  }

  ngOnInit() {
  }

  startGame() {
    // socketListening(this.socket);
    // this.gameService.startG;
    this.gameService.joinQueue();
    setInterval(() => this.queueCounter++, 1000);
  }

}
