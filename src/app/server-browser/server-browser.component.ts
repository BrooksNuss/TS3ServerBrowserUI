import { Component, OnInit, Input, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { ServerBrowserService } from './services/server-browser.service';
import { forkJoin, Subject } from 'rxjs';
import { Channel } from './models/Channel';
import { User } from './models/User';
import { ServerGroup } from './models/ServerGroup';
import { ServerBrowserCacheService } from './services/server-browser-cache.service';
import { ChannelGroup } from './models/ChannelGroup';
import { ChannelRowComponent } from './channel-row/channel-row.component';
import { ClientConnectEventResponse, ClientDisconnectEventResponse, ClientMovedEventResponse, CacheUpdateEvent } from './models/Events';
import { ServerBrowserSocketService } from './services/server-browser-socket.service';

@Component({
  selector: 'server-browser',
  templateUrl: './server-browser.component.html',
  styleUrls: ['./server-browser.component.scss']
})
export class ServerBrowserComponent implements OnInit {
  @ViewChildren(ChannelRowComponent) channelRows: QueryList<ChannelRowComponent>;
  topChannels: Channel[] = [];
  private cacheSubscription;
  // must reference socket service here to instantiate it
  constructor(
    private sbs: ServerBrowserService,
    private scs: ServerBrowserCacheService,
    private cdr: ChangeDetectorRef,
    private sss: ServerBrowserSocketService
  ) { }

  // all initial load logic takes place here (users, channels, icons, etc)
  ngOnInit() {
    const channelsReq = this.sbs.getChannelList();
    const usersReq = this.sbs.getUserList();
    const serverGroupsReq = this.sbs.getServerGroupList();
    const channelGroupsReq = this.sbs.getChannelGroupList();
    let channels: Channel[] = [];
    let topChannels: Channel[] = [];
    let users: User[] = [];
    let serverGroups: ServerGroup[] = [];
    let channelGroups: ChannelGroup[] = [];
    // wait for all backend calls to complete
    forkJoin(channelsReq, usersReq, serverGroupsReq, channelGroupsReq).subscribe(values => {
      // handle all channel responses
      values[0].forEach(value => {
        channels.push({...value, users: [], subChannels: []});
      });
      channels.forEach(channel => {
        if (channel.pid !== 0) {
          let parent = channels.find(p => p.cid === channel.pid);
          parent.subChannels.push(channel);
        }
      });
      this.updateTopChannels(channels);
      // handle all user responses
      values[1].forEach(user => {
        users.push(user);
        channels.find(channel => channel.cid === user.cid).users.push(user);
      });
      // handle all server group responses
      values[2].forEach(group => {
        // do this on the backend
        const groupModel: ServerGroup = group.group;
        groupModel.icon = group.icon;
        serverGroups.push(groupModel);
      });
      // handle all channel group responses
      values[3].forEach(group => {
        const groupModel: ChannelGroup = group.group;
        groupModel.icon = group.icon;
        channelGroups.push(groupModel);
      });
      this.scs.channels = channels;
      this.scs.users = users;
      this.scs.serverGroups = serverGroups;
      this.scs.channelGroups = channelGroups;
      let icons = serverGroups.map(g => ({data: g.icon, iconId: g.iconid}))
        .concat(channelGroups.map(g => ({data: g.icon, iconId: g.iconid})));
      this.scs.initCache(channels, users, serverGroups, channelGroups, icons);
    });

    this.cacheSubscription = this.scs.cacheUpdate$.subscribe((cacheUpdate: CacheUpdateEvent) => {
      switch (cacheUpdate.event.type) {
        case 'clientconnect': {
          users = this.scs.users;
          let channel = this.getChannelRowByCid((cacheUpdate.event as ClientConnectEventResponse).cid);
        } break; case 'clientdisconnect': {
          users = this.scs.users;
          let channel = this.getChannelRowByCid((cacheUpdate.event as ClientDisconnectEventResponse).event.clid);
        } break; case 'clientmoved': {
          users = this.scs.users;
          // this channel hasn't been updated yet, so we can still find this channel by looking for the user
          // incorrect, needs work
          let previousChannel = channels.find(channel =>
            channel.users.findIndex(user => user.clid === (cacheUpdate.event as ClientMovedEventResponse).client.clid) !== -1
          );
          let channelf = this.getChannelRowByCid(previousChannel.cid);
          let channelt = this.getChannelRowByCid((cacheUpdate.event as ClientMovedEventResponse).channel.cid);
        } break;
        case 'channeledit': {
          channels = this.scs.channels;
        } break; case 'channelcreate': {
          channels = this.scs.channels;
          this.updateTopChannels();
        } break; case 'channelmoved': {
          this.updateTopChannels();
        } break; case 'channeldelete': {
          // could splice here as well. probably just easier to do it this way.
          channels = this.scs.channels;
          this.updateTopChannels();
        }
      }
    });
  }

  getChannelRowByCid(cid: number): ChannelRowComponent {
    return this.channelRows.find(row => row.channel.cid === cid);
  }

  updateTopChannels(channels?: Channel[]) {
    if (channels) {
      this.topChannels = channels.filter(channel => channel.pid === 0);
    } else {
      this.topChannels = this.scs.channels.filter(channel => channel.pid === 0);
    }
  }
}
