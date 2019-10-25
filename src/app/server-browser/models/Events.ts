import { Channel } from './Channel';
import { User } from './User';
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
  client: User;
  type: 'clientconnect';
}

export interface ClientMovedEvent {
  channel: Channel;
  client: User;
  reasonId: number;
  type: 'clientmoved';
}

export interface ChannelEditEvent {
  channel: Channel;
  invoker: User;
  modified: {};
  reasonId: number;
  type: 'channeledit';
}

export interface ChannelCreateEvent {
  channel: Channel;
  cpid: string;
  invoker: User;
  modified: {};
  type: 'channelcreate';
}

export interface ChannelMovedEvent {
  channel: Channel;
  invoker: User;
  order: string;
  parent: Channel;
  type: 'channelmoved';
}

export interface ChannelDeletedEvent {
  cid: number;
  invoker: User;
  type: 'channeldelete';
}

export interface ClientUpdateEvent {
  client: User;
  type: 'clientupdate';
}

export interface CacheInitEvent {
  clients: User[];
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
