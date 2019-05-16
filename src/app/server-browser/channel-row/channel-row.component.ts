import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ServerBrowserCacheService } from '../services/server-browser-cache.service';
import { Channel } from '../models/Channel';
import { Subscription } from 'rxjs';

@Component({
  selector: 'channel-row',
  templateUrl: './channel-row.component.html',
  styleUrls: ['./channel-row.component.scss']
})
export class ChannelRowComponent implements OnInit, OnDestroy {
  // @Input() channelInfo: ChannelResponse;
  // @Input() users: User[] = [];
  // @Input() subChannels: Channel[] = [];
  @Input() channel: Channel;
  isSubChannel = false;
  private cacheSubscription: Subscription;
  constructor(private scs: ServerBrowserCacheService) { }

  ngOnInit() {
    // console.log(this.users);
    this.isSubChannel = this.channel.pid !== 0;
    this.cacheSubscription = this.scs.channelCacheUpdates[this.channel.cid].subscribe(cacheUpdate => {
      console.log('channel row ' + this.channel.cid + ' received event: ');
      console.log(cacheUpdate);

      switch (cacheUpdate.event.type) {
        case 'clientconnect': {
          this.channel.users.push(cacheUpdate.event.client);
        } break; case 'clientdisconnect': {
          let clientId = cacheUpdate.event.client.clid;
          this.channel.users.splice(this.channel.users.findIndex(user => user.clid === clientId), 1);
        } break; case 'clientmoved': {
          let clientId = cacheUpdate.event.client.clid;
        } break; case 'channeledit': {
        } break; case 'channelcreate': {
        } break; case 'channelmoved': {
          let channelId = cacheUpdate.cid;
          let foundIndex = this.channel.subChannels.findIndex(channel => channel.cid === channelId);
          if (foundIndex !== -1) {
            // remove from old parent
            this.channel.subChannels.splice(foundIndex, 1);
          } else if (this.channel.cid === cacheUpdate.event.channel.pid) {
            // add to new parent
            this.channel.subChannels.push(cacheUpdate.event.channel);
          } else if (this.channel.cid === cacheUpdate.cid) {
            // update channel
            let currentUsers = this.channel.users;
            let currentSubChannels = this.channel.subChannels;
            this.channel = cacheUpdate.event.channel;
            this.channel.users = currentUsers;
            this.channel.subChannels = currentSubChannels;
          }
        } break; case 'channeldelete': {
        }
      }
      // if (cacheUpdate.event.type === 'channelmoved') {
      //   let channelId = cacheUpdate.cid;
      //   let foundIndex = this.channel.subChannels.findIndex(channel => channel.cid === channelId);
      // }
    });
  }

  ngOnDestroy() {
    this.cacheSubscription.unsubscribe();
  }
}
