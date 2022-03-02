import {Pipe, PipeTransform} from "@angular/core";
import {Chat} from "../shared/chat.model";

@Pipe({
  name: 'orderByUnreadPipe',
})
export class OrderByUnreadPipe implements PipeTransform {
  transform(chats: Map<string, Chat>): any {
    return chats;
  }

}
