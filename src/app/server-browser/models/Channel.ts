import { UserResponse } from './UserResponse';
import { ChannelResponse } from './ChannelResponse';

export interface Channel {
  channelInfo: ChannelResponse;
  users: Array<UserResponse>;
}
