import {Socket} from "ngx-socket-io";
import {HttpClient} from "@angular/common/http";
import {MainSocket} from "../socket/MainSocket";
import {Injectable} from "@angular/core";
import {socketListening, gameOver, startGame, setSocket, endGame} from "./game";

export enum GameStat {
  MAIN,
  NORMAL_QUEUE,
  CUSTOM_QUEUE,
  GAME,
  LIVE_GAMES
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  stat: GameStat = GameStat.MAIN;
  liveGames: any[] = [];

  constructor(private socket: MainSocket, private http: HttpClient) {
    socket.on('gameStarted', this.joinGame.bind(this));
    socket.on('GameOver', this.gameOver.bind(this));
    endGame.subscribe({next: this.endGame.bind(this)})
    setSocket(socket);

  }

  joinNormalQueue() {
    this.socket.emit("joinDefaultGame");
    this.stat = GameStat.NORMAL_QUEUE;
  }

  joinPowerUpQueue() {
    this.socket.emit("joinCustomGame");
    this.stat = GameStat.CUSTOM_QUEUE;
  }

  leaveQueue() {
    this.socket.emit("leaveQueue", {isNormal: this.stat == GameStat.NORMAL_QUEUE});
    this.stat = GameStat.MAIN;
  }

  joinGame(gameInfo: any) {
    // setInterval(() => {
    // this.socket.emit('game/ready');

    this.stat = GameStat.GAME;

    setTimeout(() => {
      startGame(gameInfo);
    });
    // socketListening(this.socket);
    // }, 5000)
  }

  endGame() {
    this.stat = GameStat.MAIN;
  }

  gameOver(obj: any) {
    gameOver(obj);
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
    return this.stat == GameStat.NORMAL_QUEUE || this.stat == GameStat.CUSTOM_QUEUE;
  }

  isGame() {
    return this.stat == GameStat.GAME;
  }

  watchGame(gameID: string) {
    this.socket.emit('watchGame', {
      GameId: gameID
    }, (obj: any) => {
      this.stat = GameStat.GAME
      setTimeout(() => {
        startGame(obj);
      });
    });
  }

  getLiveGames() {
    this.stat = GameStat.LIVE_GAMES;

    this.socket.on('LiveGames', (games: any[]) => {
      this.liveGames = games;
    })
    this.socket.emit('LiveGamesRequest');
  }

  leaveGame() {
    this.socket.emit('leftGame');
    this.endGame();
  }
}
