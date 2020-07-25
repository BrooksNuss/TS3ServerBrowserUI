import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { transition, trigger, style, animate } from '@angular/animations';
import { ServerBrowserCacheService } from 'src/app/server-browser/services/server-browser-cache.service';
import { Client } from 'src/app/server-browser/models/business/Client';
import { ServerBrowserDataService } from 'src/app/server-browser/services/server-browser-data.service';

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
  public clientsMap;
  public get clientsArray(): Client[] {
    return Array.from<[number, Client]>(this.clientsMap).map(c => c[1]);
  }

  constructor(private sbc: ServerBrowserCacheService, private sbs: ServerBrowserDataService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    // this.sbc.cacheUpdate$.subscribe((event: CacheUpdateEvent) => {
    //   if (event.event.type === 'clientconnect') {
    //     // if existed, update. if not existed, add. if disconnect, update
    //     let existingClient = this.clientsList.get(event.event.client.databaseId);
    //     if (!existingClient) {
    //       this.clientsList.set(event.event.client.databaseId, event.event.client);
    //     }
    //   }
    // });
    this.sbc.clientStatusUpdate$.subscribe(event => {
      this.cdr.detectChanges();
    });
    this.clientsMap = this.sbc.clientsMap;
  }
}
