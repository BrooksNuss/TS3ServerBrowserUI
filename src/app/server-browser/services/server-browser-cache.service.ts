import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Channel } from '../models/Channel';
import { User } from '../models/User';
import { ServerGroup } from '../models/ServerGroup';
import { Icon } from '../models/Icon';
import { ChannelGroup } from '../models/ChannelGroup';
import { Subject, Observable } from 'rxjs';
import { ClientConnectEventResponse, ClientDisconnectEventResponse, ClientMovedEventResponse, ChannelEditEventResponse, CacheUpdateEvent, ChannelCreateEventResponse, ChannelMovedEventResponse, ChannelDeletedEventResponse, TS3ServerEvent, TS3ServerEventType } from '../models/Events';

@Injectable()
export class ServerBrowserCacheService {
  channels: Channel[] = [];
  users: User[] = [];
  serverGroups: ServerGroup[] = [];
  channelGroups: ChannelGroup[] = [];
  icons: Icon[] = [];
  // channel specific cache update observables. only subscribed to/emits events to its associated channel.
  public channelCacheUpdates: {[key: string]: Subject<CacheUpdateEvent>} = {};
  // general cache update observable. emits all cache update events, can be subscribed to anywhere.
  private cacheSubject = new Subject<CacheUpdateEvent>();
  public cacheUpdate$ = this.cacheSubject.asObservable();

  constructor(private socket: Socket) { }

  getIcon(iconId: string) {
    return this.icons.find(icon => icon.iconId === iconId);
  }

  addIcons(...icons: Icon[]) {
    this.icons = this.icons.concat(icons);
  }

  updateIcons(...icons: Icon[]) {
    let oldIconMap = this.icons.map(icon => icon.iconId);
    icons.forEach(icon => {
      let oldIndex = oldIconMap.indexOf(icon.iconId);
      if (oldIndex !== -1) {
        this.icons[oldIndex] = icon;
      } else {
        this.icons.push(icon);
      }
    });
  }

  getServerGroupIcons(...serverGroupIds: Array<number>): Array<Icon> {
    return this.serverGroups.filter(group => serverGroupIds.includes(group.sgid))
      .map(group => ({data: group.icon, iconId: group.iconid}));
  }

  getChannelGroupIcons(...channelGroupIds: Array<number>): Array<Icon> {
    return this.channelGroups.filter(group => channelGroupIds.includes(group.cgid))
      .map(group => ({data: group.icon, iconId: group.iconid}));
  }

  connectUser(event: ClientConnectEventResponse) {
    // add user to cache, update channel user connected to.
    // by default, event client has no cid, instead has a ctid
    event.client.cid = event.client['ctid'];
    this.users.push(event.client);
    let cacheUpdateEvent = this.createCacheUpdateEvent(event.cid, event, 'clientconnect');
    this.channelCacheUpdates[event.cid].next(cacheUpdateEvent);
    this.cacheSubject.next(cacheUpdateEvent);
  }

  disconnectUser(event: ClientDisconnectEventResponse) {
    // remove user from cache, update channel user disconnected from.
    let clientIndex = this.users.findIndex(client => client.clid === event.client.clid);
    this.users.splice(clientIndex);
    let cacheUpdateEvent = this.createCacheUpdateEvent(event.event.cfid, event, 'clientdisconnect');
    this.channelCacheUpdates[event.event.cfid].next(cacheUpdateEvent);
    this.cacheSubject.next(cacheUpdateEvent);
  }

  moveUser(event: ClientMovedEventResponse) {
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

  editChannel(event: ChannelEditEventResponse) {
    let channelIndex = this.channels.findIndex(channel => channel.cid === event.channel.cid);
    this.channels[channelIndex] = event.channel;
    // this.cacheSubject.next({cid: event.channel.cid, event, type: 'channeledit'});
  }

  createChannel(event: ChannelCreateEventResponse) {
    // for a temporary channel, we need to move the user into it
    // let newChannel: Channel = {channelInfo: event.channel, users: [], subChannels: []};
    // if (event.channel.pid) {
    //   let parent = this.channels.find(channel => channel.channelInfo.cid === event.channel.pid);
    //   parent.subChannels.push(newChannel);
    // }
    this.channels.push({...event.channel, users: [], subChannels: []});
    // this.cacheSubject.next({cid: event.channel.cid, event, type: 'channelcreate'});
  }

  moveChannel(event: ChannelMovedEventResponse) {
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

  deleteChannel(event: ChannelDeletedEventResponse) {
    this.channels.splice(this.channels.findIndex(channel => channel.cid === event.cid), 1);
    // this.cacheSubject.next({cid: event.cid, event, type: 'channeldelete'});
  }

  private createCacheUpdateEvent(cid: number, event: TS3ServerEvent, type: TS3ServerEventType): CacheUpdateEvent {
    let cacheUpdate = {cid, event};
    cacheUpdate.event.type = type;
    return cacheUpdate;
  }
}
