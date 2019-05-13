import { Component, OnInit, Input } from '@angular/core';
import { User } from '../models/User';
import { ChannelResponse } from '../models/ChannelResponse';
import { ServerBrowserCacheService } from '../services/server-browser-cache.service';
import { CacheUpdateEvent, TS3ClientEvents } from '../models/Events';

@Component({
  selector: 'channel-row',
  templateUrl: './channel-row.component.html',
  styleUrls: ['./channel-row.component.scss']
})
export class ChannelRowComponent implements OnInit {
  @Input() channelInfo: ChannelResponse;
  @Input() users: User[] = [];
  constructor(private scs: ServerBrowserCacheService) { }

  ngOnInit() {
    console.log(this.users);
  }

  updateChannelUsers(userUpdate: CacheUpdateEvent) {
    this.users = this.scs.users.filter(user => user.cid === this.channelInfo.cid && user.clid === (userUpdate.event as TS3ClientEvents).client.clid);
  }
}
