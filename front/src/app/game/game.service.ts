import {Socket} from "ngx-socket-io";
import {HttpClient} from "@angular/common/http";

class GameService {

  constructor(private socket: Socket, private http: HttpClient) {
  }

  joinQueue() {
    this.socket.emit("game/joinQueue");
  }

}
