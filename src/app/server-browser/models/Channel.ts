import { ListChannelResponse } from './ListChannelResponse';
import { ListUserResponse } from './listUserResponse';

export interface Channel {
  channelInfo: ListChannelResponse;
  users: ListUserResponse[];
}
