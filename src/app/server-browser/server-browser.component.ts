import { Component, OnInit, Input, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { ServerBrowserService } from './services/server-browser.service';
import { forkJoin, Subject } from 'rxjs';
import { Channel } from './models/Channel';
import { User } from './models/User';
import { ServerGroup } from './models/ServerGroup';
import { ServerBrowserCacheService } from './services/server-browser-cache.service';
import { ChannelGroup } from './models/ChannelGroup';
import { ServerBrowserSocketService } from './services/server-browser-socket.service';
import { ChannelRowComponent } from './channel-row/channel-row.component';
import { ClientConnectEventResponse, ClientDisconnectEventResponse, ClientMovedEventResponse, CacheUpdateEvent } from './models/Events';

@Component({
  selector: 'server-browser',
  templateUrl: './server-browser.component.html',
  styleUrls: ['./server-browser.component.scss']
})
export class ServerBrowserComponent implements OnInit {
  @ViewChildren(ChannelRowComponent) channelRows: QueryList<ChannelRowComponent>;
  channels: Channel[] = [];
  topChannels: Channel[] = [];
  users: User[] = [];
  serverGroups: ServerGroup[] = [];
  channelGroups: ChannelGroup[] = [];
  private cacheSubscription;
  constructor(private sbs: ServerBrowserService, private scs: ServerBrowserCacheService, private sss: ServerBrowserSocketService, private cdr: ChangeDetectorRef) { }

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
        this.channels.push({...value, users: [], subChannels: []});
      });
      this.channels.forEach(channel => {
        if (channel.pid !== 0) {
          let parent = this.channels.find(p => p.cid === channel.pid);
          parent.subChannels.push(channel);
        }
      });
      this.updateTopChannels();
      // handle all user responses
      values[1].forEach(user => {
        this.users.push(user);
        this.channels.find(channel => channel.cid === user.cid).users.push(user);
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
      this.scs.serverGroups = this.serverGroups;
      this.scs.channelGroups = this.channelGroups;
      this.scs.addIcons(...this.serverGroups.map(group => ({data: group.icon, iconId: group.iconid})));
      this.scs.updateIcons(...this.channelGroups.map(group => ({data: group.icon, iconId: group.iconid})));
      this.channels.forEach(channel => {
        this.scs.channelCacheUpdates[channel.cid] = new Subject();
      });
    });

    this.cacheSubscription = this.scs.cacheUpdate$.subscribe((cacheUpdate: CacheUpdateEvent) => {
      let channelsToUpdate: Array<{channel: ChannelRowComponent, event: any}> = [];
      switch (cacheUpdate.event.type) {
        case 'clientconnect': {
          this.users = this.scs.users;
          let channel = this.getChannelRowByCid((cacheUpdate.event as ClientConnectEventResponse).cid);
          channelsToUpdate.push({channel, event: cacheUpdate.event});
        } break; case 'clientdisconnect': {
          this.users = this.scs.users;
          let channel = this.getChannelRowByCid((cacheUpdate.event as ClientDisconnectEventResponse).event.clid);
          channelsToUpdate.push({channel, event: cacheUpdate.event});
        } break; case 'clientmoved': {
          this.users = this.scs.users;
          // this channel hasn't been updated yet, so we can still find this channel by looking for the user
          // incorrect, needs work
          let previousChannel = this.channels.find(channel =>
            channel.users.findIndex(user => user.clid === (cacheUpdate.event as ClientMovedEventResponse).client.clid) !== -1
          );
          let channelf = this.getChannelRowByCid(previousChannel.cid);
          let channelt = this.getChannelRowByCid((cacheUpdate.event as ClientMovedEventResponse).channel.cid);
          channelsToUpdate.push({channel: channelf, event: cacheUpdate.event});
          channelsToUpdate.push({channel: channelt, event: cacheUpdate.event});
        } break;
        case 'channeledit': {
          this.channels = this.scs.channels;
        } break; case 'channelcreate': {
          this.channels = this.scs.channels;
          this.updateTopChannels();
        } break; case 'channelmoved': {
          this.updateTopChannels();
        } break; case 'channeldelete': {
          // could splice here as well. probably just easier to do it this way.
          this.channels = this.scs.channels;
          this.updateTopChannels();
        }
      }
    });
  }

  getChannelRowByCid(cid: number): ChannelRowComponent {
    return this.channelRows.find(row => row.channel.cid === cid);
  }

  updateTopChannels() {
    this.topChannels = this.channels.filter(channel => channel.pid === 0);
  }
}
