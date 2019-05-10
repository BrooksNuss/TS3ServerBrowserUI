import { UserResponse } from './UserResponse';
import { ChannelResponse } from './ChannelResponse';

export interface ClientDisconnectResponseEvent {
  client: {clid: number};
  event: {
    cfid: number;
    clid: number;
    ctid: number;
    reasonid: number;
    reasonmsg: string;
  };
}

export interface ClientConnectEventResponse {
  cid: number;
  client: UserResponse;
}

export interface ClientMovedEventResponse {
  channel: ChannelResponse;
  client: UserResponse;
  reasonId: number;
}

export interface ChannelEditEventResponse {
  channel: ChannelResponse;
  invoker: UserResponse;
  modified: {};
  reasonId: number;
}

export interface ChannelCreateEventResponse {
  channel: ChannelResponse;
  cpid: string;
  invoker: UserResponse;
  modified: {};
}

export interface ChannelMovedEventResponse {
  channel: ChannelResponse;
  invoker: UserResponse;
  order: string;
  parent: ChannelResponse;
}

export interface ChannelDeletedEventResponse {
  cid: number;
  invoker: UserResponse;
}
