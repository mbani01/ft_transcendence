import { ChannelType } from "../common/chat.types";

export class CreateDMDto {
    name: string;
    isChannel: boolean;
    channelType: ChannelType;
}