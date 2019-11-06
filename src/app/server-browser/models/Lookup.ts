import { ServerGroup } from './ServerGroup';
import { ChannelGroup } from './ChannelGroup';
import { User } from './User';
import { Channel } from './Channel';

export interface ServerBrowserLookup {
  clients: User[];
  channels: Channel[];
  serverGroups: ServerGroup[];
  channelGroups: ChannelGroup[];
}
