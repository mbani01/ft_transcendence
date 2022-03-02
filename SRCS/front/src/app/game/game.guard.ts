import {ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Observable} from "rxjs";
import {GameService} from "./game.service";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class GameGuard implements CanDeactivate<any> {

  constructor(private gameService: GameService) {
  }

  canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (nextState?.url !== '/login' && this.gameService.isQueue() || this.gameService.isGame()) {
      if (confirm('Are you sure you want to leave the ' + (this.gameService.isGame() ? 'game' : 'queue'))) {
        if (this.gameService.isQueue())
          this.gameService.leaveQueue();
        else
          this.gameService.leaveGame();
        return true;
      } else {
        return false
      }
    }
    return true;
  }

}
