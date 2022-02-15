import {Socket} from "ngx-socket-io";
import {HttpClient} from "@angular/common/http";
import {MainSocket} from "../socket/MainSocket";

class GameService {

  constructor(private socket: MainSocket, private http: HttpClient) {
  }

  joinQueue() {
    this.socket.emit("game/joinQueue");
  }

}
