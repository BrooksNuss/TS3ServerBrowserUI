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
    this.cacheSubject.next({cid: event.channel.cid, event, type: 'channeledit'});
  }

  createChannel(event: ChannelCreateEventResponse) {
    // for a temporary channel, we need to move the user into it
    // let newChannel: Channel = {channelInfo: event.channel, users: [], subChannels: []};
    // if (event.channel.pid) {
    //   let parent = this.channels.find(channel => channel.channelInfo.cid === event.channel.pid);
    //   parent.subChannels.push(newChannel);
    // }
    this.channels.push({channelInfo: event.channel, users: [], subChannels: []});
    this.cacheSubject.next({cid: event.channel.cid, event, type: 'channelcreate'});
  }

  moveChannel(event: ChannelMovedEventResponse) {
    // let channel = this.channels.splice(this.channels.findIndex(c => c.channelInfo.cid === event.channel.cid), 1)[0];
    // this.channels.splice(parseInt(event.order), 0, channel);
    // channel positioning (parent/order wise) is all automatic because of the channelrow bindings.
    let newParentIndex = this.channels.findIndex(channel => channel.channelInfo.cid === event.channel.pid);
    let oldParentIndex = this.channels.find(channel => channel.channelInfo.cid === event.channel.cid).channelInfo.pid;
    let channelIndex = this.channels.findIndex(channel => channel.channelInfo.cid === event.channel.cid);
    let oldParent: Channel;
    // add channel to new parent
    if (newParentIndex !== -1) {
      this.channels[newParentIndex].channelInfo = event.parent;
    }
    // remove channel from old parent
    if (oldParentIndex !== -1 && oldParentIndex !== 0) {
      oldParent = this.channels[oldParentIndex];
      oldParent.subChannels.splice(oldParent.subChannels.findIndex(sc => sc.channelInfo.cid === event.channel.cid), 1);
    }
    // update channel info
    this.channels[channelIndex].channelInfo = event.channel;
    // UNIQUE CID USAGE: CID REFERS TO OLD PARENT FOR THIS INSTEAD OF CURRENT CID
    this.cacheSubject.next({cid: oldParent ? oldParent.channelInfo.cid : null, event, type: 'channelmoved'});
  }

  deleteChannel(event: ChannelDeletedEventResponse) {
    this.channels.splice(this.channels.findIndex(channel => channel.channelInfo.cid === event.cid), 1);
    this.cacheSubject.next({cid: event.cid, event, type: 'channeldelete'});
  }
}
