import { Component, OnInit, Input } from '@angular/core';
import { User } from '../models/User';
import { ChannelResponse } from '../models/ChannelResponse';
import { ServerBrowserCacheService } from '../services/server-browser-cache.service';
import { CacheUpdateEvent, TS3ClientEvents } from '../models/Events';
import { Channel } from '../models/Channel';

@Component({
  selector: 'channel-row',
  templateUrl: './channel-row.component.html',
  styleUrls: ['./channel-row.component.scss']
})
export class ChannelRowComponent implements OnInit {
  // @Input() channelInfo: ChannelResponse;
  // @Input() users: User[] = [];
  // @Input() subChannels: Channel[] = [];
  @Input() channel: Channel;
  isSubChannel = false;
  constructor(private scs: ServerBrowserCacheService) { }

  ngOnInit() {
    // console.log(this.users);
    this.isSubChannel = this.channel.channelInfo.pid !== 0;
  }

  updateView() {
    console.log('help');
  }

  updateChannelUsers(userUpdate: CacheUpdateEvent) {
    this.channel.users = this.scs.users.filter(user => user.cid === this.channel.channelInfo.cid && user.clid === (userUpdate.event as TS3ClientEvents).client.clid);
  }

  updateChannelInfo(channelUpdate: CacheUpdateEvent) {
    let cacheChannel = this.scs.channels.find(channel => channel.channelInfo.cid === this.channel.channelInfo.cid);
    this.channel.channelInfo = cacheChannel.channelInfo;
    this.channel.subChannels = cacheChannel.subChannels;
  }
}
