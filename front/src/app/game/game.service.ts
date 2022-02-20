import {Socket} from "ngx-socket-io";
import {HttpClient} from "@angular/common/http";
import {MainSocket} from "../socket/MainSocket";
import {Injectable} from "@angular/core";
import {socketListening, gameOver, startGame, setSocket} from "./game";

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
    setSocket(socket);

  }

  joinNormalQueue() {
    console.log('sendNormalQueueEvent')
    this.socket.emit("joinDefaultGame");
    this.stat = GameStat.NORMAL_QUEUE;
  }

  joinPowerUpQueue() {
    console.log('sendCustomQueueEvent')
    this.socket.emit("joinCustomGame");
    this.stat = GameStat.CUSTOM_QUEUE;
  }

  leaveQueue() {
    console.log('leaveQueue');
    this.socket.emit("leaveQueue", {isNormal: this.stat == GameStat.NORMAL_QUEUE});
    this.stat = GameStat.MAIN;
  }

  joinGame(gameInfo: any) {
    // setInterval(() => {
    // this.socket.emit('game/ready');

    this.stat = GameStat.GAME;
    console.log('joinGame');

    setTimeout(() => {
      startGame(gameInfo);
    });
    // socketListening(this.socket);
    // }, 5000)
  }

  leaveGame() {
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
      console.log(obj);
    });

    setTimeout(() => {
      startGame({GameId: gameID, ball: { x: -600, y: -600 }, isDefaultGame: true});
    });
    this.stat = GameStat.GAME
  }

  getLiveGames() {
    this.stat = GameStat.LIVE_GAMES;

    this.socket.on('LiveGames', (games: any[]) => {
      this.liveGames = games;
    })
    this.socket.emit('LiveGamesRequest');
  }
}
