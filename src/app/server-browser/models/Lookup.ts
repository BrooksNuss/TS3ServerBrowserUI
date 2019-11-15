import { ServerGroup } from './ServerGroup';
import { ChannelGroup } from './ChannelGroup';
import { Client } from './Client';
import { Channel } from './Channel';

export interface ServerBrowserLookup {
  clients: Client[];
  channels: Channel[];
  serverGroups: ServerGroup[];
  channelGroups: ChannelGroup[];
}
