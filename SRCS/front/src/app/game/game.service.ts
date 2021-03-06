import {HttpClient} from "@angular/common/http";
import {MainSocket} from "../socket/MainSocket";
import {Injectable, TemplateRef} from "@angular/core";
import {gameOver, startGame, setSocket, endGame, leftTab} from "./game";
import {BehaviorSubject} from "rxjs";
import {NotifierService} from "angular-notifier";
import {OAuthService} from "../login/oauth.service";
import {Router} from "@angular/router";
import {STATUS, User} from "../shared/user";
import {environment} from "../../environments/environment";

export enum GameStat {
  MAIN,
  NORMAL_QUEUE,
  CUSTOM_QUEUE,
  GAME,
  GAME_OVER,
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
    socket.on('invitedToGame', this.gameInvite.bind(this))
    socket.on('invitationRejected', this.inviteDeclined.bind(this))

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
    this.router.navigate(['/play']).then(value => {
      if (this.isQueue()) {
        this.leaveQueue();
      }
      this.stat = GameStat.MAIN;
      this.socket.on('GameOver', this.gameOver.bind(this));
      setTimeout(() => {
        this.stat = GameStat.GAME;
        setTimeout(() => {
          startGame(gameInfo);
        })
      });
    })
  }

  endGame() {
    this.stat = GameStat.MAIN;
    this.socket.removeListener('GameOver');
  }

  gameOver(obj: any) {
    this.stat = GameStat.GAME_OVER;
    gameOver(obj);
  }
  spectateGame(roomID: string) {
    this.socket.emit('game/watch', roomID, this.spectateGameCallback);
  }

  spectateGameCallback() {

  }

  isMain() {
    return this.stat === GameStat.MAIN;
  }

  isQueue() {
    return this.stat === GameStat.NORMAL_QUEUE || this.stat === GameStat.CUSTOM_QUEUE;
  }

  isGame() {
    return this.stat === GameStat.GAME;
  }

  isGameOver() {
    return this.stat === GameStat.GAME_OVER
  }

  watchGame(gameID: string) {
    this.socket.emit('watchGame', {
      GameId: gameID
    }, (obj: any) => {
      this.stat = GameStat.GAME
      this.socket.on('GameOver', this.gameOver.bind(this));
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
    this.stat = GameStat.MAIN;
    this.socket.emit('leftGame');
    this.endGame();
    leftTab();
  }

  gameInvite(invite: {InvitationId: string, SenderName: string}) {
    this.notifierService.show({
      id: invite.InvitationId,
      message: `${invite.SenderName} invited you for a game`,
      type: 'warning',
      template: this.duelTmpl.value!
    })
  }

  inviteResponse(invitationID: string, isAccepted: boolean) {
    this.socket.emit('GameInvitationReceived', {
      InvitationId: invitationID,
      isAccepted: isAccepted
    }, (err: any) => {
      if (err.error) {
        this.notifierService.notify('error', err.error);
      }
    })
    this.notifierService.hide(invitationID);
  }

  inviteDeclined(err: any) {
    this.notifierService.notify('error', err.error);

  }


  invitePlay(user: User) {
    this.socket.emit('SendGameInvitation', {
      receiverId: user.uid,
      isDefaultGame: true
    }, (err: any) => {
      if (err.error) {
        this.notifierService.notify('error', err.error);
      }
    })
  }

  getPlayerStatus(userID: number) {
    return this.http.get<{ status: STATUS }>(`${environment.apiBaseUrl}/users/status`, {
      params: {
        id: userID
      }
    });
  }

}
