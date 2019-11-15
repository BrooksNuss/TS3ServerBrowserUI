import { ChannelResponse } from './ChannelResponse';
import { Client } from './Client';

export interface Channel extends ChannelResponse {
  clients?: Array<Client>;
  subChannels?: Channel[];
}
