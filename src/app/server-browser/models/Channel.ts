import { ChannelResponse } from './ChannelResponse';
import { User } from './User';

export interface Channel extends ChannelResponse {
  users?: Array<User>;
  subChannels?: Channel[];
}
