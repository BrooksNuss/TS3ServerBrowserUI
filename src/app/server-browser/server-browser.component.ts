import { Component, OnInit, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { ServerBrowserDataService } from './services/server-browser-data.service';
import { ServerBrowserCacheService } from './services/server-browser-cache.service';
import { ChannelRowComponent } from './channel-row/channel-row.component';
import { CacheUpdateEvent } from './models/Events';
import { ServerBrowserSocketService } from './services/server-browser-socket.service';
import { ClientAvatarCache } from './models/AvatarCacheModel';
import { AvatarListRequest } from './models/AvatarListRequest';

@Component({
  selector: 'server-browser',
  templateUrl: './server-browser.component.html',
  styleUrls: ['./server-browser.component.scss']
})
export class ServerBrowserComponent implements OnInit {
  @ViewChildren(ChannelRowComponent) channelRows: QueryList<ChannelRowComponent>;
  // topChannels: Channel[] = [];
  channels;
  private cacheSubscription;
  // must reference socket service here to instantiate it
  constructor(
    private sds: ServerBrowserDataService,
    private scs: ServerBrowserCacheService,
    private cdr: ChangeDetectorRef,
    private sss: ServerBrowserSocketService
  ) { }

  // all initial load logic takes place here (users, channels, icons, etc)
  ngOnInit(): void {
    const sbLookup = this.sds.getLookup();
    sbLookup.subscribe(res => {
      this.scs.initCache(res);
      this.channels = this.scs.channels;
      this.updateTopChannels();
      // let icons = serverGroups.map(g => ({icon: g.icon, iconid: g.iconid}))
      //   .concat(channelGroups.map(g => ({icon: g.icon, iconid: g.iconid})));
    });
    this.cacheSubscription = this.scs.cacheUpdate$.subscribe((cacheUpdate: CacheUpdateEvent) => {
      switch (cacheUpdate.type) {
        // case 'clientconnect': {
        //   users = this.scs.clients;
        //   let channel = this.getChannelRowByCid((cacheUpdate.event as ClientConnectEvent).cid);
        // } break; case 'clientdisconnect': {
        //   users = this.scs.clients;
        //   let channel = this.getChannelRowByCid((cacheUpdate.event as ClientDisconnectEvent).event.clid);
        // } break; case 'clientmoved': {
        //   users = this.scs.clients;
        //   // this channel hasn't been updated yet, so we can still find this channel by looking for the user
        //   // incorrect, needs work
        //   let previousChannel = channels.find(channel =>
        //     channel.clients.findIndex(user => user.clid === (cacheUpdate.event as ClientMovedEvent).client.clid) !== -1
        //   );
        //   let channelf = this.getChannelRowByCid(previousChannel.cid);
        //   let channelt = this.getChannelRowByCid((cacheUpdate.event as ClientMovedEvent).channel.cid);
        // } break;
        // case 'channeledit': {
        //   this.channels = this.scs.channels;
        // } break;
        case 'channelcreate': {
          this.updateTopChannels();
        } break; case 'channelmoved': {
          this.updateTopChannels();
        } break; case 'channeldelete': {
          // could splice here as well. probably just easier to do it this way.
          this.updateTopChannels();
        }
      }
    });
  }

  // getChannelRowByCid(cid: number): ChannelRowComponent {
  //   return this.channelRows.find(row => row.channel.cid === cid);
  // }

  updateTopChannels(): void {
      this.channels = this.scs.channels.filter(channel => channel.pid === 0);
  }
}
