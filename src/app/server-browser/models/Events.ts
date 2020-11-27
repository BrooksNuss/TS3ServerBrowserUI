export interface CacheUpdateEvent {
  cid: number;
  type: TS3ServerEventType;
}

export type TS3ServerEventType = 'clientdisconnect' |
  'clientconnect' |
  'clientmoved' |
  'channeledit' |
  'channelcreate' |
  'channelmoved' |
  'channeldelete' |
  'clientupdate';

export interface ClientStatus {
  clientDBId: number;
  status: AwayStatus;
}

export type AwayStatus = 'ACTIVE' | 'INACTIVE' | 'AWAY' | 'OFFLINE';
