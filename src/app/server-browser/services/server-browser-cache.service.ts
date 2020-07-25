import { Injectable } from '@angular/core';
import { Channel } from '../models/business/Channel';
import { Client } from '../models/business/Client';
import { ServerGroup } from '../models/business/ServerGroup';
import { Icon } from '../models/Icon';
import { ChannelGroup } from '../models/business/ChannelGroup';
import { Subject } from 'rxjs';
import { CacheUpdateEvent, TS3ServerEventType, ClientStatus } from '../models/Events';
import { ClientAvatarCache } from '../models/AvatarCacheModel';
import { AvatarListRequest } from '../models/AvatarListRequest';
import { ServerBrowserDataService } from './server-browser-data.service';
import { ChannelRowComponent } from '../channel-row/channel-row.component';
import { ClientRowComponent } from '../client-row/client-row.component';
import { ServerBrowserLookupResponse, ClientStatusResponse } from '../models/response/Responses';
import { mapResponseToClient, mapResponseToChannel, mapResponseToServerGroup, mapResponseToChannelGroup } from 'src/app/shared/util/ResponseMappers';

@Injectable()
export class ServerBrowserCacheService {
  channelsMap: Map<number, Channel> = new Map();
  clientsMap: Map<number, Client> = new Map();
  serverGroupsMap: Map<number, ServerGroup> = new Map();
  channelGroupsMap: Map<number, ChannelGroup> = new Map();
  // icons: Map<number, Icon> = new Map<number, Icon>();
  channelRowMap: Map<number, ChannelRowComponent> = new Map<number, ChannelRowComponent>();
  clientRowMap: Map<number, ClientRowComponent> = new Map<number, ClientRowComponent>();

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
      this.clientsMap.set(c.databaseId, c);
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
  // public channelCacheUpdates: {[key: string]: Subject<CacheUpdateEvent>} = {};
  // general cache update observable. emits all cache update events, can be subscribed to anywhere.
  private cacheSubject = new Subject<CacheUpdateEvent>();
  public cacheUpdate$ = this.cacheSubject.asObservable();
  private clientStatusSubject = new Subject();
  public clientStatusUpdate$ = this.clientStatusSubject.asObservable();
  // private cacheInitSubject = new Subject<CacheInitEvent>();
  // public cacheInit$ = this.cacheInitSubject.asObservable();

  addChannelListener(cid: number, component: ChannelRowComponent): void {
    this.channelRowMap.set(cid, component);
  }

  removeChannelListener(cid: number): void {
    this.channelRowMap.delete(cid);
  }

  addClientListener(databaseId: number, component: ClientRowComponent): void {
    this.clientRowMap.set(databaseId, component);
  }

  removeClientListener(databaseId: number): void {
    this.clientRowMap.delete(databaseId);
  }

  constructor(private sbs: ServerBrowserDataService) { }

  initCache(initResponse: ServerBrowserLookupResponse): void {
    initResponse.clients.forEach(client => {
      this.clientsMap.set(client.databaseId, mapResponseToClient(client));
    });
    initResponse.channels.forEach(channel => {
      this.channelsMap.set(channel.cid, mapResponseToChannel(channel));
    });
    initResponse.serverGroups.forEach(serverGroup => {
      this.serverGroupsMap.set(serverGroup.sgid, mapResponseToServerGroup(serverGroup));
    });
    initResponse.channelGroups.forEach(channelGroup => {
      this.channelGroupsMap.set(channelGroup.cgid, mapResponseToChannelGroup(channelGroup));
    });
    // set all channel parents/children
    this.channelsMap.forEach(channel => {
      if (channel.pid !== 0) {
        const parent = this.channels.find(p => p.cid === channel.pid);
        parent.addChannel(channel);
      }
    });
    // set all channel clients/groups
    this.clientsMap.forEach(client => {
      this.setClientGroupsAndChannel(client);
    });
    // get all avatars (for now, needs to be lazified later)
    this.getAllAvatars();
  }

  setClientGroupsAndChannel(client: Client): void {
    this.channels.find(channel => channel.cid === client.cid).addClient(client);
    client.channelGroup = this.channelGroupsMap.get(client.channelGroupId);
    client.serverGroups = this.serverGroups.filter(group => client.serverGroupIds.includes(group.sgid));
  }

  connectUser(client: Client): void {
    this.clientsMap.set(client.databaseId, client);
    this.setClientGroupsAndChannel(client);
    this.getAvatar(client);
    // this.channelsMap.get(client.cid).addClient(client);
    // this.channelRowMap.get(client.cid).addClient(client);
  }

  disconnectUser(client: Client): void {
    const oldClient = this.clientsMap.get(this.clients.find(c => c.clid === client.clid).databaseId);
    this.clientsMap.delete(oldClient.databaseId);
    this.channelsMap.get(oldClient.cid).removeClient(oldClient);
    this.channelRowMap.get(oldClient.cid).removeClient(oldClient);
  }

  moveUser(client: Client): void {
    let cachedClient = this.clientsMap.get(client.databaseId);
    let oldChannel = this.channelsMap.get(cachedClient.cid);
    oldChannel.removeClient(client);
    this.channelsMap.get(client.cid).addClient(cachedClient);
    cachedClient.cid = client.cid;
    this.channelRowMap.get(oldChannel.cid).removeClient(client);
    // this.channelRowMap.get(client.cid).addClient(cachedClient);
  }

  editChannel(channel: Channel) {
  }

  createChannel(channel: Channel) {
    this.channelsMap.set(channel.cid, channel);
    const parent = this.channelsMap.get(channel.pid);
    if (parent) {
      parent.addChannel(channel);
      // this.channelRowMap.get(channel.pid).addChannel(channel);
    }
    let cacheUpdateEvent = this.createCacheUpdateEvent(channel.cid, 'channelcreate');
    this.cacheSubject.next(cacheUpdateEvent);
  }

  moveChannel(channel: Channel) {
    // not finished
    let cachedChannel = this.channelsMap.get(channel.cid);
    let oldParent = this.channelsMap.get(cachedChannel.pid);
    cachedChannel.pid = channel.pid;
    this.channelsMap.get(channel.pid).addChannel(cachedChannel);
    oldParent.removeChannel(cachedChannel);
    let cacheUpdateEvent = this.createCacheUpdateEvent(channel.cid, 'channelmoved');
    this.cacheSubject.next(cacheUpdateEvent);
  }

  deleteChannel(channel: Channel) {
    let cachedChannel = this.channelsMap.get(channel.cid);
    const parent = this.channelsMap.get(cachedChannel.pid);
    if (parent) {
      parent.removeChannel(cachedChannel);
      this.channelRowMap.get(cachedChannel.pid).removeChannel(cachedChannel.cid);
    }
    this.channelsMap.delete(channel.cid);
    const updateEvent = this.createCacheUpdateEvent(channel.cid, 'channeldelete');
    this.cacheSubject.next(updateEvent);
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

  // updateClientStatus(event: ClientStatusEvent) {
  //   event.statusList.forEach(client => {
  //     const foundClient = this.clientsMap.get(client.clientDBId);
  //     if (foundClient) {
  //       foundClient.awayStatus = client.status;
  //     }
  //   });
  // }

  updateClientStatus(clients: ClientStatus[]): void {
    if (this.clients.length) {
      clients.forEach(status => {
        const foundClient = this.clients.find(client => client.databaseId === status.clientDBId);
        if (foundClient) {
          foundClient.awayStatus = status.status;
        }
      });
      this.clientStatusSubject.next();
    }
  }

  private createCacheUpdateEvent(cid: number, type: TS3ServerEventType): CacheUpdateEvent {
    let cacheUpdate = {cid, type};
    return cacheUpdate;
  }

  checkAvatar(client: Client): boolean {
    let expired = false;
    const key = `client_${client.databaseId}_avatar`;
    const storageItem = localStorage.getItem(key);
    if (storageItem) {
      const parsedStorageItem: ClientAvatarCache = JSON.parse(storageItem);
      if (client.avatarGUID === parsedStorageItem.avatarGUID) {
        client.avatar = parsedStorageItem.avatarBuffer;
      } else {
        expired = true;
        localStorage.removeItem(key);
      }
    } else {
      expired = true;
    }
    return expired;
  }

  getAvatar(client: Client): void {
    if (this.checkAvatar(client)) {
      this.getAvatarList([client.databaseId]);
    }
  }

  getAllAvatars(): void {
    const expired: Array<number> = [];
    this.clientsMap.forEach(client => {
      if (this.checkAvatar(client)) {
        expired.push(client.databaseId);
      }
    });
    this.getAvatarList(expired);
  }

  getAvatarList(clientIds: Array<number>): void {
    const expiredListRequest: AvatarListRequest = {clientIds};
    this.sbs.getClientAvatars(expiredListRequest).subscribe(res => {
      res.avatars.forEach((avatar: ClientAvatarCache) => {
        const c = this.clientsMap.get(avatar.clientDBId);
        c.avatar = avatar.avatarBuffer;
        localStorage.setItem(`client_${avatar.clientDBId}_avatar`, JSON.stringify(avatar));
      });
    });
  }
}
