import { ChannelResponse } from './ChannelResponse';
import { Client } from './User';

export interface Channel extends ChannelResponse {
  users?: Array<Client>;
  subChannels?: Channel[];
}
