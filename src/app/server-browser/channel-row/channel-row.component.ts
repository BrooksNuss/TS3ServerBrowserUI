import { Component, OnInit, Input } from '@angular/core';
import { User } from '../models/User';
import { ChannelResponse } from '../models/ChannelResponse';
import { ServerBrowserCacheService } from '../services/server-browser-cache.service';

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

  updateChannel(userUpdate: {cid: number, event: any, type: string}) {
    this.users = this.scs.users.filter(channel => channel.cid === this.channelInfo.cid);
  }
}
