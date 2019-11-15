import { ChannelResponse } from './ChannelResponse';
import { Client } from './Client';

export interface Channel extends ChannelResponse {
  users?: Array<Client>;
  subChannels?: Channel[];
}
