import { Client } from 'src/app/server-browser/models/business/Client';
import { Channel } from 'src/app/server-browser/models/business/Channel';
import { ClientResponse, ChannelResponse, ServerGroupResponse, ChannelGroupResponse } from 'src/app/server-browser/models/response/Responses';
import { ServerGroup } from 'src/app/server-browser/models/business/ServerGroup';
import { ChannelGroup } from 'src/app/server-browser/models/business/ChannelGroup';

export function mapResponseToClient(res: ClientResponse): Client {
  const {...c} = res;
  // could include the away status from the backend here in the response so it's available initilally
  return new Client(c.clid, c.cid, c.databaseId, c.nickname, c.serverGroupIds, undefined, c.channelGroupId, undefined, undefined, c.avatarGUID, undefined);
}

export function mapResponseToChannel(res: ChannelResponse): Channel {
  const {...c} = res;
  // could maybe include the clients and subchannels in the response
  return new Channel(c.cid, c.pid, c.name, [], [], c.topic, c.description, c.passworded);
}

export function mapResponseToServerGroup(res: ServerGroupResponse): ServerGroup {
  const {...sg} = res;
  return new ServerGroup(sg.sgid, sg.name, sg.icon, sg.iconid);
}

export function mapResponseToChannelGroup(res: ChannelGroupResponse): ChannelGroup {
  const {...cg} = res;
  return new ChannelGroup(cg.cgid, cg.name, cg.icon, cg.iconid);
}
