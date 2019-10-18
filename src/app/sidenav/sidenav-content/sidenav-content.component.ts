import { Component, OnInit, Input } from '@angular/core';
import { transition, state, trigger, style, animate } from '@angular/animations';
import { ServerBrowserCacheService } from 'src/app/server-browser/services/server-browser-cache.service';

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

  constructor(private sbc: ServerBrowserCacheService) { }

  ngOnInit() {
  }
}
