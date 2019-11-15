import { Component, OnInit, Input } from '@angular/core';
import { ServerBrowserService } from '../services/server-browser.service';
import { Client } from '../models/Client';
import { ServerBrowserCacheService } from '../services/server-browser-cache.service';
import { Icon } from '../models/Icon';

@Component({
  selector: 'client-row',
  templateUrl: './client-row.component.html',
  styleUrls: ['./client-row.component.scss']
})
export class ClientRowComponent implements OnInit {
  @Input() clientInfo: Client;
  serverGroupIcons: Array<Icon> = [];
  channelGroupIcons: Array<Icon> = [];

  constructor(private sbs: ServerBrowserService, private scs: ServerBrowserCacheService) { }

  ngOnInit() {
    this.serverGroupIcons = this.scs.getServerGroupIcons(...this.clientInfo.client_servergroups);
    this.channelGroupIcons = this.scs.getChannelGroupIcons(this.clientInfo.client_channel_group_id);
    this.serverGroupIcons = this.serverGroupIcons.filter(icon => {
      return icon.data != null && icon.iconId !== '0';
    });
    this.channelGroupIcons = this.channelGroupIcons.filter(icon => {
      return icon.data != null && icon.iconId !== '0';
    });
  }
}
