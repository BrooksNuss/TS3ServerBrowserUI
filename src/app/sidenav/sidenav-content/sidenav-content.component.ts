import { Component, OnInit, Input } from '@angular/core';
import { transition, state, trigger, style, animate } from '@angular/animations';
import { ServerBrowserCacheService } from 'src/app/server-browser/services/server-browser-cache.service';
import { CacheUpdateEvent, ClientDisconnectEvent } from 'src/app/server-browser/models/Events';
import { Client } from 'src/app/server-browser/models/Client';
import { takeWhile, filter, take } from 'rxjs/operators';
import { ServerBrowserService } from 'src/app/server-browser/services/server-browser.service';
import { ClientAvatarCache } from 'src/app/server-browser/models/AvatarCacheModel';

@Component({
  selector: 'sidenav-content',
  templateUrl: './sidenav-content.component.html',
  styleUrls: ['./sidenav-content.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('.25s', style({ opacity: 1}))
      ]),
      transition(':leave', [
        animate('.25s', style({ opacity: 0 }))
      ])
    ]),
  ]
})
export class SidenavContentComponent implements OnInit {
  @Input() set sidebarOpen(value: boolean) {
    setTimeout(() => {
      this._sidebarOpen = value;
    }, 0);
  }
  get sidebarOpen() {
    return this._sidebarOpen;
  }
  private _sidebarOpen = true;
  public usersList = new Map<number, Client>();
  public get usersArray(): Client[] {
    return Array.from(this.usersList.values());
  }

  constructor(private sbc: ServerBrowserCacheService, private sbs: ServerBrowserService) { }

  ngOnInit() {
    this.sbc.cacheUpdate$.subscribe((event: CacheUpdateEvent) => {
      if (event.event.type === 'clientconnect') {
        // if existed, update. if not existed, add. if disconnect, update
        let existingUser = this.usersList.get(event.event.client.databaseId);
        if (!existingUser) {
          this.usersList.set(event.event.client.databaseId, event.event.client);
        }
      }
    });
  }
}
