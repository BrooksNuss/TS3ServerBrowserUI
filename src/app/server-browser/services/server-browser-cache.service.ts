import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Channel } from '../models/Channel';
import { User } from '../models/User';
import { ServerGroup } from '../models/ServerGroup';
import { Icon } from '../models/Icon';

@Injectable()
export class ServerBrowserCacheService {
  channels: Channel[] = [];
  users: User[] = [];
  serverGroups: ServerGroup[] = [];
  icons: Icon[] = [];

  constructor(private socket: Socket) { }

  getIcon(iconId: number) {
    return this.icons.find(icon => icon.iconId === iconId);
  }

  addIcons(...icons: Icon[]) {
    this.icons = this.icons.concat(icons);
  }

  getIcons(...iconIds: Array<number>) {
    return this.icons.filter(icon => iconIds.includes(icon.iconId));
  }

  getServerGroupIcons(...serverGroupIds: Array<number>): Array<Icon> {
    return this.serverGroups.filter(group => serverGroupIds.includes(group.sgid))
      .map(group => ({data: group.icon, iconId: group.iconid}));
  }
}
