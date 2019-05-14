import { Component, OnInit, Input, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { ServerBrowserService } from './services/server-browser.service';
import { forkJoin } from 'rxjs';
import { Channel } from './models/Channel';
import { User } from './models/User';
import { ServerGroup } from './models/ServerGroup';
import { ServerBrowserCacheService } from './services/server-browser-cache.service';
import { ChannelGroup } from './models/ChannelGroup';
import { ServerBrowserSocketService } from './services/server-browser-socket.service';
import { ChannelRowComponent } from './channel-row/channel-row.component';
import { ClientConnectEventResponse, ClientDisconnectEventResponse, ClientMovedEventResponse, ChannelEditEventResponse, CacheUpdateEvent, ChannelCreateEventResponse, ChannelMovedEventResponse } from './models/Events';

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
        this.channels.push({channelInfo: value, users: [], subChannels: []});

      });
      this.channels.forEach(channel => {
        if (channel.channelInfo.pid) {
          let parent = this.channels.find(p => p.channelInfo.cid === channel.channelInfo.pid);
          parent.subChannels.push(channel);
        }
      });
      this.updateTopChannels();
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
          let channelf = this.getChannelRowByCid(previousChannel.channelInfo.cid);
          let channelt = this.getChannelRowByCid((cacheUpdate.event as ClientMovedEventResponse).channel.cid);
          channelsToUpdate.push({channel: channelf, event: cacheUpdate.event});
          channelsToUpdate.push({channel: channelt, event: cacheUpdate.event});
        } break;
        case 'channeledit': {
          this.channels = this.scs.channels;
          // let channel = this.getChannelRowByCid((cacheUpdate.event as ChannelEditEventResponse).channel.cid);
          // channel.channel.channelInfo = (cacheUpdate.event as ChannelEditEventResponse).channel;
        } break; case 'channelcreate': {
          // let channel = this.scs.channels.find(c => c.channelInfo.cid === (cacheUpdate.event as ChannelCreateEventResponse).channel.cid);
          // this.channels.push(channel);
          this.channels = this.scs.channels;
        } break; case 'channelmoved': {
          this.updateTopChannels();
          // oldparent isn't working properly
          if (cacheUpdate.cid) {
            this.getChannelRowByCid(cacheUpdate.cid).updateChannelInfo(cacheUpdate);
            this.getChannelRowByCid((cacheUpdate.event as ChannelMovedEventResponse).parent.cid).updateChannelInfo(cacheUpdate);
          } else {
            this.getChannelRowByCid((cacheUpdate.event as ChannelMovedEventResponse).channel.cid).updateChannelInfo(cacheUpdate);
          }
          // let oldParentId;
          // let oldChannel = this.channels.find(c => c.channelInfo.cid === (cacheUpdate.event as ChannelMovedEventResponse).channel.cid);
          // if (oldChannel.channelInfo.pid) {
          //    oldParentId = this.channels.find(c =>
          //     c.channelInfo.cid === (cacheUpdate.event as ChannelMovedEventResponse).parent.cid).channelInfo.pid;
          // }
          // this.channels = this.scs.channels;
          // this.updateTopChannels();
          // this.cdr.detectChanges();
          // let channel = this.channels.find(c => c.channelInfo.cid === cacheUpdate.cid);
          // if ((cacheUpdate.event as ChannelMovedEventResponse).parent) {
          //   // add to new parent
          //   let parent = this.getChannelRowByCid((cacheUpdate.event as ChannelMovedEventResponse).parent.cid);
          //   parent.channel.subChannels.push(channel);
          // } else {
          //   // channel has no parent
          //   let channelRow = this.getChannelRowByCid(cacheUpdate.cid);
          //   channelRow.channel.channelInfo = (cacheUpdate.event as ChannelMovedEventResponse).channel;
          //   channelRow.isSubChannel = (cacheUpdate.event as ChannelMovedEventResponse).parent ? true : false;
          // }
          // // remove channel from old parent channel
          // if (oldParentId) {
          //   let oldParent = this.channels.find(c => c.channelInfo.cid === oldParentId);
          //   oldParent.subChannels.splice(oldParent.subChannels.findIndex(c => c.channelInfo.cid === cacheUpdate.cid), 1);
          // }
        } break; case 'channeldelete': {
          // could splice here as well. probably just easier to do it this way.
          this.channels = this.scs.channels;
        }
      }
      // channelsToUpdate.forEach(channelRow => {
      //   channelRow.channel.updateChannelUsers(channelRow.event);
      // });
    });
  }

  getChannelRowByCid(cid: number): ChannelRowComponent {
    return this.channelRows.find(row => row.channel.channelInfo.cid === cid);
  }

  updateTopChannels() {
    this.topChannels = this.channels.filter(channel => channel.channelInfo.pid === 0);
  }

  debugPause() {
    console.log('pausing');
  }
}
