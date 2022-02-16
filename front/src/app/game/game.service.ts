import {Socket} from "ngx-socket-io";
import {HttpClient} from "@angular/common/http";
import {MainSocket} from "../socket/MainSocket";
import {Injectable} from "@angular/core";

export enum GameStat {
  MAIN,
  QUEUE,
  GAME
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  stat: GameStat = GameStat.MAIN;

  constructor(private socket: MainSocket, private http: HttpClient) {
    socket.on('game/joinGame', this.joinGame.bind(this));
  }

  joinQueue() {
    this.socket.emit("game/joinQueue");
    this.stat = GameStat.QUEUE;
  }

  leaveQueue() {
    this.socket.emit("game/leaveQueue");
  }

  joinGame() {
    // setInterval(() => {
    this.socket.emit('game/ready');
    this.stat = GameStat.GAME;
    // }, 5000)
  }

  leaveGame() {
    this.stat = GameStat.MAIN;
  }

  spectateGame(roomID: string) {
    this.socket.emit('game/watch', roomID, this.spectateGameCallback);
  }

  spectateGameCallback() {

  }

  isMain() {
    return this.stat == GameStat.MAIN;
  }

  isQueue() {
    return this.stat == GameStat.QUEUE;
  }

  isGame() {
    return this.stat == GameStat.GAME;
  }

}
