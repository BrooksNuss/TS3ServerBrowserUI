import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Channel } from '../models/Channel';
import { User } from '../models/User';
import { ServerGroup } from '../models/ServerGroup';
import { Icon } from '../models/Icon';
import { ChannelGroup } from '../models/ChannelGroup';
import { Subject, Observable } from 'rxjs';
import { ClientConnectEvent, ClientDisconnectEvent, ClientMovedEvent, ChannelEditEvent, CacheUpdateEvent, ChannelCreateEvent, ChannelMovedEvent, ChannelDeletedEvent, TS3ServerEvent, TS3ServerEventType, ClientUpdateEvent, CacheInitEvent } from '../models/Events';

@Injectable()
export class ServerBrowserCacheService {
  channels: Channel[] = [];
  users: User[] = [];
  serverGroups: ServerGroup[] = [];
  channelGroups: ChannelGroup[] = [];
  icons: Map<string, Icon> = new Map<string, Icon>();
  // channel specific cache update observables. only subscribed to/emits events to its associated channel.
  public channelCacheUpdates: {[key: string]: Subject<CacheUpdateEvent>} = {};
  // general cache update observable. emits all cache update events, can be subscribed to anywhere.
  private cacheSubject = new Subject<CacheUpdateEvent>();
  public cacheUpdate$ = this.cacheSubject.asObservable();
  private cacheInitSubject = new Subject<CacheInitEvent>();
  public cacheInit$ = this.cacheInitSubject.asObservable();

  constructor() { }

  initCache(channels: Channel[], users: User[], serverGroups: ServerGroup[], channelGroups: ChannelGroup[], icons: Icon[]) {
    this.channels = channels;
    this.users = users;
    this.serverGroups = serverGroups;
    this.channelGroups = channelGroups;
    icons.forEach(icon => {
      this.icons.set(icon.iconId, icon);
    });
    this.channels.forEach(channel => {
      this.channelCacheUpdates[channel.cid] = new Subject();
    });
    this.broadcastCacheInit();
  }

  getIcon(iconId: string) {
    return this.icons.get(iconId);
  }

  getServerGroupIcons(...serverGroupIds: Array<number>): Array<Icon> {
    return this.serverGroups.filter(group => serverGroupIds.includes(group.sgid))
      .map(group => ({data: group.icon, iconId: group.iconid}));
  }

  getChannelGroupIcons(...channelGroupIds: Array<number>): Array<Icon> {
    return this.channelGroups.filter(group => channelGroupIds.includes(group.cgid))
      .map(group => ({data: group.icon, iconId: group.iconid}));
  }

  broadcastCacheInit() {
    let event: CacheInitEvent = {
      clients: this.users,
      channels: this.channels,
      serverGroups: this.serverGroups,
      channelGroups: this.channelGroups,
      type: 'cacheinit'
    };
    this.cacheInitSubject.next(event);
  }

  connectUser(event: ClientConnectEvent) {
    // add user to cache, update channel user connected to.
    // by default, event client has no cid, instead has a ctid
    event.client.cid = event.client['ctid'];
    this.users.push(event.client);
    let cacheUpdateEvent = this.createCacheUpdateEvent(event.cid, event, 'clientconnect');
    this.channelCacheUpdates[event.cid].next(cacheUpdateEvent);
    this.cacheSubject.next(cacheUpdateEvent);
  }

  disconnectUser(event: ClientDisconnectEvent) {
    // remove user from cache, update channel user disconnected from.
    let clientIndex = this.users.findIndex(client => client.clid === event.client.clid);
    this.users.splice(clientIndex);
    let cacheUpdateEvent = this.createCacheUpdateEvent(event.event.cfid, event, 'clientdisconnect');
    this.channelCacheUpdates[event.event.cfid].next(cacheUpdateEvent);
    this.cacheSubject.next(cacheUpdateEvent);
  }

  moveUser(event: ClientMovedEvent) {
    // remove client from previous channel, update client, add to new channel.
    let clientIndex = this.users.findIndex(client => client.clid === event.client.clid);
    let oldChannel = this.channels.find(channel => channel.cid === this.users[clientIndex].cid);
    oldChannel.users.splice(oldChannel.users.findIndex(user => user.clid === event.client.clid), 1);
    this.users[clientIndex] = event.client;
    this.channels.find(channel => channel.cid === event.channel.cid).users.push(this.users[clientIndex]);
    let cacheUpdateEvent = this.createCacheUpdateEvent(event.channel.cid, event, 'clientmoved');
    this.channelCacheUpdates[event.channel.cid].next(cacheUpdateEvent);
    this.channelCacheUpdates[oldChannel.cid].next(cacheUpdateEvent);
    this.cacheSubject.next(cacheUpdateEvent);
  }

  editChannel(event: ChannelEditEvent) {
    // set channel as new channel
    let cacheUpdateEvent = this.createCacheUpdateEvent(event.channel.cid, event, 'channeledit');
    this.channelCacheUpdates[event.channel.cid].next(cacheUpdateEvent);
    this.cacheSubject.next(cacheUpdateEvent);
  }

  createChannel(event: ChannelCreateEvent) {
    // for a temporary channel, we need to move the user into it
    let parentChannel = this.channels.find(channel => channel.cid === parseInt(event.cpid));
    (event.channel as Channel).subChannels = [];
    (event.channel as Channel).users = [];
    this.channels.push(event.channel);
    let cacheUpdateEvent = this.createCacheUpdateEvent(event.channel.cid, event, 'channelcreate');
    if (parentChannel) {
      this.channelCacheUpdates[event.cpid].next(cacheUpdateEvent);
    }
    this.channelCacheUpdates[event.channel.cid] = new Subject();
    this.cacheSubject.next(cacheUpdateEvent);
  }

  moveChannel(event: ChannelMovedEvent) {
    // update cache, old parent, new parent, and channel
    let oldParent = this.channels.find(channel => channel.cid === event.channel.cid);
    this.channels[this.channels.findIndex(channel => channel.cid === event.channel.cid)] = event.channel;
    let cacheUpdateEvent = this.createCacheUpdateEvent(event.channel.cid, event, 'channelmoved');
    if (event.parent) {
      this.channelCacheUpdates[event.parent.cid].next(cacheUpdateEvent);
    }
    if (oldParent && oldParent.pid !== 0) {
      this.channelCacheUpdates[oldParent.pid].next(cacheUpdateEvent);
    }
    this.channelCacheUpdates[event.channel.cid].next(cacheUpdateEvent);
    this.cacheSubject.next(cacheUpdateEvent);
  }

  deleteChannel(event: ChannelDeletedEvent) {
    // update cache, parent
    let parentId = this.channels.find(channel => channel.cid === event.cid).pid;
    this.channels.splice(this.channels.findIndex(channel => channel.cid === event.cid), 1);
    let cacheUpdateEvent = this.createCacheUpdateEvent(event.cid, event, 'channeldelete');
    if (parentId) {
      this.channelCacheUpdates[parentId].next(cacheUpdateEvent);
    }
    this.cacheSubject.next(cacheUpdateEvent);
    // this.cacheSubject.next({cid: event.cid, event, type: 'channeldelete'});
  }

  updateClient(event?: ClientUpdateEvent) {
    let userIndex = this.users.findIndex(user => user.cid === event.client.clid);
    this.users[userIndex] = event.client;
    let cacheUpdateEvent = this.createCacheUpdateEvent(event.client.cid, event, 'clientupdate');
    this.channelCacheUpdates[event.client.cid].next(cacheUpdateEvent);
    this.cacheSubject.next(cacheUpdateEvent);
  }

  private createCacheUpdateEvent(cid: number, event: TS3ServerEvent, type: TS3ServerEventType): CacheUpdateEvent {
    let cacheUpdate = {cid, event};
    cacheUpdate.event.type = type;
    return cacheUpdate;
  }
}
