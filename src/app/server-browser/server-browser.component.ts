import { Component, OnInit, Input } from '@angular/core';
import { ServerBrowserService } from './services/server-browser.service';
import { forkJoin } from 'rxjs';
import { ListUserResponse } from './models/listUserResponse';
import { Channel } from './models/Channel';
import { User } from './models/User';
import { ServerGroup } from './models/ServerGroup';
import { ServerBrowserCacheService } from './services/server-browser-cache.service';
import { Icon } from './models/Icon';

@Component({
  selector: 'server-browser',
  templateUrl: './server-browser.component.html',
  styleUrls: ['./server-browser.component.scss']
})
export class ServerBrowserComponent implements OnInit {
  // these arrays should only be useful for initial load.
  // once the initial data is retrieved, it should all be stored in
  // a service. this service will handle push notifications
  // (for user leaving/connecting/something updating) and will update those
  // values locally then emit those values to all necessary components
  // TODO: Create push notification service
  // Maybe also a secondary data service or just use the existing sbs?
  channels: Channel[] = [];
  users: User[] = [];
  serverGroups: ServerGroup[] = [];
  constructor(private sbs: ServerBrowserService, private scs: ServerBrowserCacheService) { }

  // all initial load logic takes place here (users, channels, icons, etc)
  ngOnInit() {
    const channelsReq = this.sbs.getChannelList();
    const usersReq = this.sbs.getUserList();
    const serverGroupsReq = this.sbs.getServerGroupList();
    forkJoin(channelsReq, usersReq, serverGroupsReq).subscribe(values => {
      // handle all channel responses
      values[0].forEach(value => {
        this.channels.push({channelInfo: value, users: []});
      });
      // handle all user responses
      values[1].forEach(user => {
        this.users.push(user);
        this.channels.find(channel => channel.channelInfo.cid === user.cid).users.push(user);
      });
      // handle all server group responses
      values[2].forEach(group => {
        // do this on the backend
        const groupModel: ServerGroup = group.group;
        groupModel.icon = group.icon;
        this.serverGroups.push(groupModel);
      });
      this.scs.channels = this.channels;
      this.scs.users = this.users;
      this.scs.serverGroups = this.serverGroups;
      this.scs.addIcons(...this.serverGroups.map(group => ({data: group.icon, iconId: group.iconid})));
    });
  }
}
