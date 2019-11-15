import { Injectable } from '@angular/core';
import { Channel } from '../models/Channel';
import { Client } from '../models/Client';
import { ServerGroup } from '../models/ServerGroup';
import { Icon } from '../models/Icon';
import { ChannelGroup } from '../models/ChannelGroup';
import { Subject, Observable } from 'rxjs';
import { ClientConnectEvent, ClientDisconnectEvent, ClientMovedEvent, ChannelEditEvent, CacheUpdateEvent, ChannelCreateEvent, ChannelMovedEvent, ChannelDeletedEvent, TS3ServerEvent, TS3ServerEventType, ClientUpdateEvent, CacheInitEvent, ClientStatusEvent } from '../models/Events';

@Injectable()
export class ServerBrowserCacheService {
  channelsMap: Map<number, Channel> = new Map();
  clientsMap: Map<number, Client> = new Map();
  serverGroupsMap: Map<number, ServerGroup> = new Map();
  channelGroupsMap: Map<number, ChannelGroup> = new Map();
  icons: Map<string, Icon> = new Map<string, Icon>();
  // setters and getters for mapping internal maps to arrays
  set channels(channelArr: Channel[]) {
    channelArr.forEach(c => {
      this.channelsMap.set(c.cid, c);
    });
  }
  get channels(): Channel[] {
    return Array.from(this.channelsMap.values());
  }
  set clients(clientArr: Client[]) {
    clientArr.forEach(c => {
      this.clientsMap.set(c.client_database_id, c);
    });
  }
  get clients(): Client[] {
    return Array.from(this.clientsMap.values());
  }
  set serverGroups(serverGroupArr: ServerGroup[]) {
    serverGroupArr.forEach(sg => {
      this.serverGroupsMap.set(sg.sgid, sg);
    });
  }
  get serverGroups(): ServerGroup[] {
    return Array.from(this.serverGroupsMap.values());
  }
  set channelGroups(channelGroupArr: ChannelGroup[]) {
    channelGroupArr.forEach(cg => {
      this.channelGroupsMap.set(cg.cgid, cg);
    });
  }
  get channelGroups(): ChannelGroup[] {
    return Array.from(this.channelGroupsMap.values());
  }
  // channel specific cache update observables. only subscribed to/emits events to its associated channel.
  public channelCacheUpdates: {[key: string]: Subject<CacheUpdateEvent>} = {};
  // general cache update observable. emits all cache update events, can be subscribed to anywhere.
  private cacheSubject = new Subject<CacheUpdateEvent>();
  public cacheUpdate$ = this.cacheSubject.asObservable();
  private cacheInitSubject = new Subject<CacheInitEvent>();
  public cacheInit$ = this.cacheInitSubject.asObservable();

  constructor() { }

  initCache(channels: Channel[], clients: Client[], serverGroups: ServerGroup[], channelGroups: ChannelGroup[], icons: Icon[]) {
    this.channels = channels;
    this.clients = clients;
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
      clients: this.clients,
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
    // this.clients.push(event.client);
    this.clientsMap.set(event.client.client_database_id, event.client);
    let cacheUpdateEvent = this.createCacheUpdateEvent(event.cid, event, 'clientconnect');
    this.channelCacheUpdates[event.cid].next(cacheUpdateEvent);
    this.cacheSubject.next(cacheUpdateEvent);
  }

  disconnectUser(event: ClientDisconnectEvent) {
    // remove user from cache, update channel user disconnected from.
    // let clientIndex = this.clients.findIndex(client => client.clid === event.client.clid);
    // this.users.splice(clientIndex);
    this.clientsMap.delete(this.clients.find(c => c.clid === event.client.clid).client_database_id);
    let cacheUpdateEvent = this.createCacheUpdateEvent(event.event.cfid, event, 'clientdisconnect');
    this.channelCacheUpdates[event.event.cfid].next(cacheUpdateEvent);
    this.cacheSubject.next(cacheUpdateEvent);
  }

  moveUser(event: ClientMovedEvent) {
    // remove client from previous channel, update client, add to new channel.
    let oldChannel = this.channelsMap.get(event.client.cid);
    oldChannel.users.splice(oldChannel.users.findIndex(user => user.clid === event.client.clid));
    this.clientsMap.get(event.client.client_database_id).cid = event.channel.cid;
    this.channelsMap.get(event.channel.cid).users.push(this.clientsMap.get(event.client.client_database_id));
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
    let parentChannel = this.channelsMap.get(event.cpid);
    event.channel.subChannels = [];
    event.channel.users = [];
    // this.channels.push(event.channel);
    this.channelsMap.set(event.channel.cid, event.channel);
    let cacheUpdateEvent = this.createCacheUpdateEvent(event.channel.cid, event, 'channelcreate');
    if (parentChannel) {
      this.channelCacheUpdates[event.cpid].next(cacheUpdateEvent);
    }
    this.channelCacheUpdates[event.channel.cid] = new Subject();
    this.cacheSubject.next(cacheUpdateEvent);
  }

  moveChannel(event: ChannelMovedEvent) {
    // update cache, old parent, new parent, and channel
    let oldParent = this.channelsMap.get(event.channel.cid);
    this.channelsMap.set(event.channel.cid, event.channel);
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
    let parentId = this.channelsMap.get(event.cid).pid;
    this.channelsMap.delete(event.cid);
    let cacheUpdateEvent = this.createCacheUpdateEvent(event.cid, event, 'channeldelete');
    if (parentId) {
      this.channelCacheUpdates[parentId].next(cacheUpdateEvent);
    }
    this.cacheSubject.next(cacheUpdateEvent);
  }

  // this needs to be more specific. certain field updates have to be handled differently from others
  // see updateClientStatus for a similar example
  // updateClient(event?: ClientUpdateEvent) {
  //   let userIndex = this.users.findIndex(user => user.cid === event.client.clid);
  //   this.users[userIndex] = event.client;
  //   let cacheUpdateEvent = this.createCacheUpdateEvent(event.client.cid, event, 'clientupdate');
  //   this.channelCacheUpdates[event.client.cid].next(cacheUpdateEvent);
  //   this.cacheSubject.next(cacheUpdateEvent);
  // }

  updateClientStatus(event: ClientStatusEvent) {
    event.clients.forEach(client => {
      this.clientsMap.get(client.clientDBId).awayStatus = client.status;
    });
  }

  private createCacheUpdateEvent(cid: number, event: TS3ServerEvent, type: TS3ServerEventType): CacheUpdateEvent {
    let cacheUpdate = {cid, event};
    cacheUpdate.event.type = type;
    return cacheUpdate;
  }
}
