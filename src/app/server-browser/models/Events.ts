import { UserResponse } from './UserResponse';
import { ChannelResponse } from './ChannelResponse';

export interface ClientDisconnectEventResponse {
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

export interface ClientConnectEventResponse {
  cid: number;
  client: UserResponse;
  type: 'clientconnect';
}

export interface ClientMovedEventResponse {
  channel: ChannelResponse;
  client: UserResponse;
  reasonId: number;
  type: 'clientmoved';
}

export interface ChannelEditEventResponse {
  channel: ChannelResponse;
  invoker: UserResponse;
  modified: {};
  reasonId: number;
  type: 'channeledit';
}

export interface ChannelCreateEventResponse {
  channel: ChannelResponse;
  cpid: string;
  invoker: UserResponse;
  modified: {};
  type: 'channelcreate';
}

export interface ChannelMovedEventResponse {
  channel: ChannelResponse;
  invoker: UserResponse;
  order: string;
  parent: ChannelResponse;
  type: 'channelmoved';
}

export interface ChannelDeletedEventResponse {
  cid: number;
  invoker: UserResponse;
  type: 'channeldelete';
}

export interface CacheUpdateEvent {
  cid: number;
  event: TS3ServerEvent;
}

export type TS3ServerEvent = ClientDisconnectEventResponse |
  ClientConnectEventResponse |
  ClientMovedEventResponse |
  ChannelEditEventResponse |
  ChannelCreateEventResponse |
  ChannelMovedEventResponse |
  ChannelDeletedEventResponse;

export type TS3ClientEvents = ClientDisconnectEventResponse |
  ClientConnectEventResponse |
  ClientMovedEventResponse;

export type TS3ServerEventType = 'clientdisconnect' |
  'clientconnect' |
  'clientmoved' |
  'channeledit' |
  'channelcreate' |
  'channelmoved' |
  'channeldelete';
