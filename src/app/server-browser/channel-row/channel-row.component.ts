import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ServerBrowserCacheService } from '../services/server-browser-cache.service';
import { Channel } from '../models/business/Channel';
import { Subscription } from 'rxjs';
import { DataChannelService } from 'src/app/services/dataChannel.service';
import { Client } from '../models/business/Client';

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
  collapsed = false;
  constructor(private scs: ServerBrowserCacheService, private dataChannelService: DataChannelService) { }

  ngOnInit() {
    // console.log(this.users);
    this.scs.addChannelListener(this.channel.cid, this);
    this.isSubChannel = this.channel.pid !== 0;
    // this.cacheSubscription = this.scs.channelCacheUpdates[this.channel.cid].subscribe(cacheUpdate => {
    //   console.log('channel row ' + this.channel.cid + ' received event: ');
    //   console.log(cacheUpdate);

    //   switch (cacheUpdate.event.type) {
    //     case 'clientconnect': {
    //       this.channel.clients.push(cacheUpdate.event.client);
    //     } break; case 'clientdisconnect': {
    //       let clientId = cacheUpdate.event.client.clid;
    //       this.channel.clients.splice(this.channel.clients.findIndex(user => user.clid === clientId), 1);
    //     } break; case 'clientmoved': {
    //       let clientId = cacheUpdate.event.client.clid;
    //     } break; case 'channeledit': {
    //       Object.assign(this.channel, cacheUpdate.event.modified);
    //     } break; case 'channelcreate': {
    //       this.channel.subChannels.push(cacheUpdate.event.channel);
    //     } break; case 'channelmoved': {
    //       let channelId = cacheUpdate.cid;
    //       let foundIndex = this.channel.subChannels.findIndex(channel => channel.cid === channelId);
    //       if (foundIndex !== -1) {
    //         // remove from old parent
    //         this.channel.subChannels.splice(foundIndex, 1);
    //       } else if (this.channel.cid === cacheUpdate.event.channel.pid) {
    //         // add to new parent
    //         this.channel.subChannels.push(cacheUpdate.event.channel);
    //       } else if (this.channel.cid === cacheUpdate.cid) {
    //         // update channel
    //         let currentUsers = this.channel.clients;
    //         let currentSubChannels = this.channel.subChannels;
    //         this.channel = cacheUpdate.event.channel;
    //         this.channel.clients = currentUsers;
    //         this.channel.subChannels = currentSubChannels;
    //       }
    //     } break; case 'channeldelete': {
    //       this.channel.subChannels.splice(this.channel.subChannels.findIndex(sub => sub.cid === cacheUpdate.cid), 1);
    //     }
    //   }
    //   // if (cacheUpdate.event.type === 'channelmoved') {
    //   //   let channelId = cacheUpdate.cid;
    //   //   let foundIndex = this.channel.subChannels.findIndex(channel => channel.cid === channelId);
    //   // }
    // });
  }

  addClient(client: Client): void {
    this.channel.clients.push(client);
  }

  removeClient(client: Client): void {
    this.channel.clients.splice(this.channel.clients.findIndex(c => c.clid === client.clid), 1);
  }

  addChannel(channel: Channel): void {
    this.channel.subChannels.push(channel);
  }

  removeChannel(cid: number): void {
    this.channel.subChannels.splice(this.channel.subChannels.findIndex(channel => channel.cid === cid), 1);
  }

  ngOnDestroy(): void {
    this.scs.removeChannelListener(this.channel.cid);
    // this.scs.removeChannelListener(this.channel.cid);
  }

  joinChannel(): void {
    this.dataChannelService.joinChannel(this.channel.cid);
  }
}
