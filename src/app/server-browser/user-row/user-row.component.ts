import { Component, OnInit, Input } from '@angular/core';
import { ServerBrowserService } from '../services/server-browser.service';
import { Client } from '../models/Client';
import { ServerBrowserCacheService } from '../services/server-browser-cache.service';
import { Icon } from '../models/Icon';

@Component({
  selector: 'user-row',
  templateUrl: './user-row.component.html',
  styleUrls: ['./user-row.component.scss']
})
export class UserRowComponent implements OnInit {
  @Input() userInfo: Client;
  serverGroupIcons: Array<Icon> = [];
  channelGroupIcons: Array<Icon> = [];

  constructor(private sbs: ServerBrowserService, private scs: ServerBrowserCacheService) { }

  ngOnInit() {
    this.serverGroupIcons = this.scs.getServerGroupIcons(...this.userInfo.client_servergroups);
    this.channelGroupIcons = this.scs.getChannelGroupIcons(this.userInfo.client_channel_group_id);
    this.serverGroupIcons = this.serverGroupIcons.filter(icon => {
      return icon.data != null && icon.iconId !== '0';
    });
    this.channelGroupIcons = this.channelGroupIcons.filter(icon => {
      return icon.data != null && icon.iconId !== '0';
    })
  }
}
