import {Socket} from "ngx-socket-io";
import {HttpClient} from "@angular/common/http";
import {MainSocket} from "../socket/MainSocket";
import {Injectable, TemplateRef} from "@angular/core";
import {socketListening, gameOver, startGame, setSocket, endGame} from "./game";
import {BehaviorSubject} from "rxjs";
import {NotifierService} from "angular-notifier";
import {User} from "../shared/user";
import {OAuthService} from "../login/oauth.service";
import {Router} from "@angular/router";

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

  public duelTmpl = new BehaviorSubject<TemplateRef<any> | null>(null);

  constructor(private socket: MainSocket, private http: HttpClient, private notifierService: NotifierService,
              private oAuthService: OAuthService, private router: Router) {
    socket.on('gameStarted', this.joinGame.bind(this));
    socket.on('GameOver', this.gameOver.bind(this));
    socket.on('gameInvite', this.gameInvite.bind(this))
    socket.on('inviteAccepted', this.inviteAccepted.bind(this));
    endGame.subscribe({next: this.endGame.bind(this)})
    setSocket(socket);
    console.log('Game Service');
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
    this.stat = GameStat.GAME;

    setTimeout(() => {
      startGame(gameInfo);
    });
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

  gameInvite(user: User) {
    this.notifierService.show({
      id: String(user.uid),
      message: `${user.name} invited you for a game`,
      type: 'warning',
      template: this.duelTmpl.value!
    })
  }

  acceptInvite(userID: string) {
    this.socket.emit('acceptInvite', {
      inviter: userID,
      invited: this.oAuthService.user.uid
    }, (err: any) => {
      if (err.error) {
        this.notifierService.notify('error', err.error);
      }
    })
    this.notifierService.hide(userID);
  }

  declineInvite(userID: string) {
    this.socket.emit('declineInvite', {
      inviter: userID,
      invited: this.oAuthService.user.uid
    })
    this.notifierService.hide(userID);
  }

  inviteAccepted(gameInfo: any) {
    this.router.navigate(['/play']).then(value => {
      if (value) {
        this.joinGame(gameInfo);
      }
    })
  }
}
