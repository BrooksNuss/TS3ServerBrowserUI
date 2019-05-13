import { Component, OnInit, Input, ViewChildren, QueryList } from '@angular/core';
import { ServerBrowserService } from './services/server-browser.service';
import { forkJoin } from 'rxjs';
import { Channel } from './models/Channel';
import { User } from './models/User';
import { ServerGroup } from './models/ServerGroup';
import { ServerBrowserCacheService } from './services/server-browser-cache.service';
import { ChannelGroup } from './models/ChannelGroup';
import { ServerBrowserSocketService } from './services/server-browser-socket.service';
import { ChannelRowComponent } from './channel-row/channel-row.component';
import { ClientConnectEventResponse, ClientDisconnectEventResponse, ClientMovedEventResponse, ChannelEditEventResponse, CacheUpdateEvent, ChannelCreateEventResponse } from './models/Events';

@Component({
  selector: 'server-browser',
  templateUrl: './server-browser.component.html',
  styleUrls: ['./server-browser.component.scss']
})
export class ServerBrowserComponent implements OnInit {
  @ViewChildren(ChannelRowComponent) channelRows: QueryList<ChannelRowComponent>;
  channels: Channel[] = [];
  users: User[] = [];
  serverGroups: ServerGroup[] = [];
  channelGroups: ChannelGroup[] = [];
  private cacheSubscription;
  constructor(private sbs: ServerBrowserService, private scs: ServerBrowserCacheService, private sss: ServerBrowserSocketService) { }

  // all initial load logic takes place here (users, channels, icons, etc)
  ngOnInit() {
    const channelsReq = this.sbs.getChannelList();
    const usersReq = this.sbs.getUserList();
    const serverGroupsReq = this.sbs.getServerGroupList();
    const channelGroupsReq = this.sbs.getChannelGroupList();
    // wait for all backend calls to complete
    forkJoin(channelsReq, usersReq, serverGroupsReq, channelGroupsReq).subscribe(values => {
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
      // handle all channel group responses
      values[3].forEach(group => {
        const groupModel: ChannelGroup = group.group;
        groupModel.icon = group.icon;
        this.channelGroups.push(groupModel);
      });
      this.scs.channels = this.channels;
      this.scs.users = this.users;
      this.scs.serverGroups = this.serverGroups;0
      this.scs.channelGroups = this.channelGroups;
      this.scs.addIcons(...this.serverGroups.map(group => ({data: group.icon, iconId: group.iconid})));
      this.scs.updateIcons(...this.channelGroups.map(group => ({data: group.icon, iconId: group.iconid})));
    });

    this.cacheSubscription = this.scs.cacheUpdate$.subscribe((cacheUpdate: CacheUpdateEvent) => {
      let channelsToUpdate: Array<{channel: ChannelRowComponent, event: any}> = [];
      switch (cacheUpdate.type) {
        case 'clientconnect': {
          this.users = this.scs.users;
          let channel = this.getChannelRowByCid((cacheUpdate.event as ClientConnectEventResponse).cid)
          channelsToUpdate.push({channel: channel, event: cacheUpdate.event});
        } break; case 'clientdisconnect': {
          this.users = this.scs.users;
          let channel = this.getChannelRowByCid((cacheUpdate.event as ClientDisconnectEventResponse).event.clid);
          channelsToUpdate.push({channel: channel, event: cacheUpdate.event});
        } break; case 'clientmoved': {
          this.users = this.scs.users;
          let channelf = this.getChannelRowByCid((cacheUpdate.event as ClientMovedEventResponse).client.cfid);
          let channelt = this.getChannelRowByCid((cacheUpdate.event as ClientMovedEventResponse).channel.cid);
          channelsToUpdate.push({channel: channelf, event: cacheUpdate.event});
          channelsToUpdate.push({channel: channelt, event: cacheUpdate.event});
        } break; case 'channeledit': {
          this.channels = this.scs.channels;
          let channel = this.getChannelRowByCid((cacheUpdate.event as ChannelEditEventResponse).channel.cid);
          channel.channelInfo = (cacheUpdate.event as ChannelEditEventResponse).channel;
        } break; case 'channelcreate': {
          let channel = this.scs.channels.find(channel => channel.channelInfo.cid === (cacheUpdate.event as ChannelCreateEventResponse).channel.cid);
          this.channels.push(channel);
        } break; case 'channelmoved': {
          this.channels = this.scs.channels;
        } break; case 'channeldelete': {
          //could splice here as well. probably just easier to do it this way.
          this.channels = this.scs.channels;
        }
      }
      channelsToUpdate.forEach(channelRow => {
        channelRow.channel.updateChannelUsers(channelRow.event);
      });
    });
  }

  getChannelRowByCid(cid: number): ChannelRowComponent {
    return this.channelRows.find(row => row.channelInfo.cid === cid);
  }

  debugPause() {
    console.log('pausing');
  }
}
