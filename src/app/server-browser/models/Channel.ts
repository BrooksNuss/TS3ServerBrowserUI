import { UserResponse } from './UserResponse';
import { ChannelResponse } from './ChannelResponse';

export interface Channel extends ChannelResponse {
  users?: Array<UserResponse>;
  subChannels?: Channel[];
}
