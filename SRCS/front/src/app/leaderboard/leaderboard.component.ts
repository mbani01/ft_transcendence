import {Component} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {map, Observable} from "rxjs";
import {LeaderboardPlayer} from "../shared/leaderboard";

@Component({
  selector: 'app-leaderboard',
  templateUrl: 'leaderboard.component.html',
  styleUrls: ['leaderboard.component.scss']
})
export class LeaderboardComponent {

  topPlayers: Observable<LeaderboardPlayer[]>;
  constructor(private http: HttpClient) {
    this.topPlayers = this.getTopPlayers();
  }

  getTopPlayers() {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/game/leaderBoard`, {
      params: {
        sort: 'wins',
        limit: 20
      }
    }).pipe(map((value: any[]) => value.map(
      player => ({
        uid: player.id,
        name: player.username,
        img: player.avatar,
        wins: player.gamesWon,
        games: player.gamesCount,
        score: player.score,
        rank: player.rank
      } as LeaderboardPlayer))));
  }
}
