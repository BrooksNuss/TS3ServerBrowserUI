import { ClientStatus } from '../Events';

export interface ClientResponse {
  clid: number;
  cid?: number;
  databaseId: number;
  nickname?: string;
  avatarGUID?: string;
  serverGroupIds?: Array<number>;
  channelGroupId?: number;
  cfid?: number;
}

export interface ChannelResponse {
  cid: number;
  name?: string;
  pid?: number;
  topic?: string;
  description?: string;
  passworded?: boolean;
}

export interface ServerGroupResponse {
  sgid: number;
  name: string;
  icon?: string;
  iconid?: number;
}

export interface ChannelGroupResponse {
  cgid: number;
  name: string;
  icon?: string;
  iconid?: number;
}

export interface ServerBrowserLookupResponse {
  clients: ClientResponse[];
  channels: ChannelResponse[];
  serverGroups: ServerGroupResponse[];
  channelGroups: ChannelGroupResponse[];
}

export interface ServerBrowserLookupResponse {
  clients: ClientResponse[];
  channels: ChannelResponse[];
  serverGroups: ServerGroupResponse[];
  channelGroups: ChannelGroupResponse[];
}

export interface ClientStatusResponse {
  clients: ClientStatus[];
}
