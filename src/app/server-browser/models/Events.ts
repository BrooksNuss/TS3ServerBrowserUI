import { Channel } from './Channel';
import { Client, AwayStatus } from './Client';
import { ServerGroup } from './ServerGroup';
import { ChannelGroup } from './ChannelGroup';

export interface ClientDisconnectEvent {
  client: {clid: number};
  event: {
    cfid: number;
    clid: number;
    ctid: number;
    reasonid: number;
    reasonmsg: string;
  };
  type: 'clientdisconnect';
}

export interface ClientConnectEvent {
  cid: number;
  client: Client;
  type: 'clientconnect';
}

export interface ClientMovedEvent {
  channel: Channel;
  client: Client;
  reasonId: number;
  type: 'clientmoved';
}

export interface ChannelEditEvent {
  channel: Channel;
  invoker: Client;
  modified: {};
  reasonId: number;
  type: 'channeledit';
}

export interface ChannelCreateEvent {
  channel: Channel;
  cpid: number;
  invoker: Client;
  modified: {};
  type: 'channelcreate';
}

export interface ChannelMovedEvent {
  channel: Channel;
  invoker: Client;
  order: string;
  parent: Channel;
  type: 'channelmoved';
}

export interface ChannelDeletedEvent {
  cid: number;
  invoker: Client;
  type: 'channeldelete';
}

export interface ClientUpdateEvent {
  client: Client;
  type: 'clientupdate';
}

export interface ClientStatusEvent {
  clients: ClientStatus[];
  type: 'clientstatus';
}

export interface ClientStatus {
  clientDBId: number;
  status: AwayStatus;
}

export interface CacheInitEvent {
  clients: Client[];
  channels: Channel[];
  serverGroups: ServerGroup[];
  channelGroups: ChannelGroup[];
  type: 'cacheinit';
}

export interface CacheUpdateEvent {
  cid: number;
  event: TS3ServerEvent;
}

export type TS3ServerEvent = ClientDisconnectEvent |
  ClientConnectEvent |
  ClientMovedEvent |
  ChannelEditEvent |
  ChannelCreateEvent |
  ChannelMovedEvent |
  ChannelDeletedEvent |
  ClientUpdateEvent |
  CacheInitEvent;

export type TS3ClientEvents = ClientDisconnectEvent |
  ClientConnectEvent |
  ClientMovedEvent |
  ClientUpdateEvent;

export type TS3ServerEventType = 'clientdisconnect' |
  'clientconnect' |
  'clientmoved' |
  'channeledit' |
  'channelcreate' |
  'channelmoved' |
  'channeldelete' |
  'clientupdate';

export interface DataChannelMessage<T = string> {
  type: string;
  data: T;
}
