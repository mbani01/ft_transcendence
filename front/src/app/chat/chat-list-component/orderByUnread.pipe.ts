import {Pipe, PipeTransform} from "@angular/core";
import {Chat} from "../shared/chat.model";
import {KeyValue} from "@angular/common";

@Pipe({
  name: 'orderByUnreadPipe',
})
export class OrderByUnreadPipe implements PipeTransform {
  transform(chats: Map<string, Chat>): any {
    // let entries = new Map([...chats.entries()].sort(
    //   (a, b) => {
    //     console.log(a);
    //     return 1
    //   }));
    //
    // console.log(chats);
    return chats;
  }

}
