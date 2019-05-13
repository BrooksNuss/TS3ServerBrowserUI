import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Channel } from '../models/Channel';
import { User } from '../models/User';
import { ServerGroup } from '../models/ServerGroup';
import { Icon } from '../models/Icon';
import { ChannelGroup } from '../models/ChannelGroup';
import { Subject } from 'rxjs';
import { ClientConnectEventResponse, ClientDisconnectEventResponse, ClientMovedEventResponse, ChannelEditEventResponse, CacheUpdateEvent, ChannelCreateEventResponse, ChannelMovedEventResponse, ChannelDeletedEventResponse } from '../models/Events';

@Injectable()
export class ServerBrowserCacheService {
  channels: Channel[] = [];
  users: User[] = [];
  serverGroups: ServerGroup[] = [];
  channelGroups: ChannelGroup[] = [];
  icons: Icon[] = [];
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
    this.users.push(event.client);
    this.cacheSubject.next({cid: event.cid, event, type: 'clientconnect'});
  }

  disconnectUser(event: ClientDisconnectEventResponse) {
    let clientIndex = this.users.findIndex(client => client.cid === event.client.clid);
    this.users.splice(clientIndex);
    this.cacheSubject.next({cid: event.event.cfid, event, type: 'clientdisconnect'});
  }

  moveUser(event: ClientMovedEventResponse) {
    let clientIndex = this.users.findIndex(client => client.cid === event.client.cid);
    this.users[clientIndex] = event.client;
    this.cacheSubject.next({cid: event.channel.cid, event, type: 'clientmoved'});
  }

  editChannel(event: ChannelEditEventResponse) {
    let channelIndex = this.channels.findIndex(channel => channel.channelInfo.cid === event.channel.cid);
    this.channels[channelIndex].channelInfo = event.channel;
    this.cacheSubject.next({cid: event.channel.cid, event, type: 'channeledit'})
  }

  createChannel(event: ChannelCreateEventResponse) {
    this.channels.push({channelInfo: event.channel, users: []});
    this.cacheSubject.next({cid: event.channel.cid, event, type: 'channelcreate'});
  }

  moveChannel(event: ChannelMovedEventResponse) {
    // need to test to figure out how this one works.
    // let channel = this.channels.splice(this.channels.findIndex(channel => channel.channelInfo.cid === event.channel.cid), 1);
    // this.channels.splice(event.order, 0, channel);
    this.cacheSubject.next({cid: event.channel.cid, event, type: 'channelmoved'});
  }

  deleteChannel(event: ChannelDeletedEventResponse) {
    this.channels.splice(this.channels.findIndex(channel => channel.channelInfo.cid === event.cid), 1);
    this.cacheSubject.next({cid: event.cid, event, type: 'channeldelete'});
  }
}
