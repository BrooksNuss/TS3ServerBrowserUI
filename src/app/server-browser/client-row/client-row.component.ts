import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ServerBrowserService } from '../services/server-browser.service';
import { Client } from '../models/Client';
import { ServerBrowserCacheService } from '../services/server-browser-cache.service';
import { Icon } from '../models/Icon';
import { TooltipMenuComponent } from 'src/app/shared/tooltip-context-menu/tooltip-context-menu.component';
import { TooltipConfig } from 'src/app/shared/models/TooltipConfig';
import { FlexibleConnectedPositionStrategy, Overlay } from '@angular/cdk/overlay';
import { TooltipMenuDirective } from 'src/app/shared/tooltip-menu.directive';

@Component({
  selector: 'client-row',
  templateUrl: './client-row.component.html',
  styleUrls: ['./client-row.component.scss']
})
export class ClientRowComponent implements OnInit {
  @Input() clientInfo: Client;
  serverGroupIcons: Array<Icon> = [];
  channelGroupIcons: Array<Icon> = [];
  // tooltipConfig: TooltipConfig = {
  //   type: TooltipMenuComponent,
  //   config: {},
  //   openEvent: 'onmouseenter',
  //   closeEvent: 'onmouseleave',
  //   openDelay: 1000
  // };

  constructor(private sbs: ServerBrowserService, private scs: ServerBrowserCacheService) { }

  ngOnInit() {
    this.serverGroupIcons = this.scs.getServerGroupIcons(...this.clientInfo.servergroups);
    this.channelGroupIcons = this.scs.getChannelGroupIcons(this.clientInfo.channelGroupId);
    this.serverGroupIcons = this.serverGroupIcons.filter(icon => {
      return icon.data != null && icon.iconId !== '0';
    });
    this.channelGroupIcons = this.channelGroupIcons.filter(icon => {
      return icon.data != null && icon.iconId !== '0';
    });
  }
}
