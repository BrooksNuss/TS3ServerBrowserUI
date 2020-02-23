import { Component, OnInit, Input } from '@angular/core';
import { ServerBrowserService } from '../services/server-browser.service';
import { User } from '../models/User';
import { ServerBrowserCacheService } from '../services/server-browser-cache.service';
import { Icon } from '../models/Icon';

@Component({
  selector: 'user-row',
  templateUrl: './user-row.component.html',
  styleUrls: ['./user-row.component.scss']
})
export class UserRowComponent implements OnInit {
  @Input() userInfo: User;
  serverGroupIcons: Array<Icon> = [];
  channelGroupIcons: Array<Icon> = [];

  constructor(private sbs: ServerBrowserService, private scs: ServerBrowserCacheService) { }

  ngOnInit() {
    this.serverGroupIcons = this.scs.getServerGroupIcons(...this.userInfo.servergroups);
    this.channelGroupIcons = this.scs.getChannelGroupIcons(this.userInfo.channelGroupId);
    this.serverGroupIcons = this.serverGroupIcons.filter(icon => {
      return icon.data != null && icon.iconId !== '0';
    });
    this.channelGroupIcons = this.channelGroupIcons.filter(icon => {
      return icon.data != null && icon.iconId !== '0';
    })
  }
}
