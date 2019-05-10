import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Channel } from '../models/Channel';
import { User } from '../models/User';
import { ServerGroup } from '../models/ServerGroup';
import { Icon } from '../models/Icon';
import { ChannelGroup } from '../models/ChannelGroup';
import { Subject } from 'rxjs';
import { ClientConnectEventResponse, ClientDisconnectResponseEvent } from '../models/ClientEvents';

@Injectable()
export class ServerBrowserCacheService {
  channels: Channel[] = [];
  users: User[] = [];
  serverGroups: ServerGroup[] = [];
  channelGroups: ChannelGroup[] = [];
  icons: Icon[] = [];
  private userSubject = new Subject<{cid: number, event: any, type: string}>();
  public userUpdate$ = this.userSubject.asObservable();

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
    this.userSubject.next({cid: event.cid, event, type: 'connect'});
  }

  disconnectUser(event: ClientDisconnectResponseEvent) {
    let clientIndex = this.users.findIndex(client => client.cid === event.client.clid);
    this.users.splice(clientIndex);
    this.userSubject.next({cid: event.event.cfid, event, type: 'connect'});
  }
}
