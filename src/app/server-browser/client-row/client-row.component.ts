import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ServerBrowserDataService } from '../services/server-browser-data.service';
import { Client } from '../models/business/Client';
import { ServerBrowserCacheService } from '../services/server-browser-cache.service';
import { Icon } from '../models/Icon';
import { TooltipMenuComponent } from 'src/app/shared/tooltip-context-menu/tooltip-context-menu.component';
import { TooltipConfig } from 'src/app/shared/models/TooltipConfig';
import { FlexibleConnectedPositionStrategy, Overlay } from '@angular/cdk/overlay';
import { TooltipMenuDirective } from 'src/app/shared/tooltip-menu.directive';
import { Channel } from '../models/business/Channel';

@Component({
  selector: 'client-row',
  templateUrl: './client-row.component.html',
  styleUrls: ['./client-row.component.scss']
})
export class ClientRowComponent implements OnInit, OnDestroy {
  @Input() clientInfo: Client;
  @Input() channel: Channel;
  // serverGroupIcons: Array<Icon> = [];
  // channelGroupIcons: Array<Icon> = [];
  // tooltipConfig: TooltipConfig = {
  //   type: TooltipMenuComponent,
  //   config: {},
  //   openEvent: 'onmouseenter',
  //   closeEvent: 'onmouseleave',
  //   openDelay: 1000
  // };

  constructor(private sbs: ServerBrowserDataService, private scs: ServerBrowserCacheService) { }

  ngOnInit(): void {
    this.scs.addClientListener(this.clientInfo.databaseId, this);
    // this.serverGroupIcons = this.scs.getServerGroupIcons(...this.clientInfo.serverGroupIds);
    // this.channelGroupIcons = this.scs.getChannelGroupIcons(this.clientInfo.channelGroupId);
    // this.serverGroupIcons = this.serverGroupIcons.filter(icon => icon.iconid !== 0);
    // this.channelGroupIcons = this.channelGroupIcons.filter(icon => icon.iconid !== 0);
  }

  ngOnDestroy(): void {
    this.scs.removeClientListener(this.clientInfo.databaseId);
  }
}
