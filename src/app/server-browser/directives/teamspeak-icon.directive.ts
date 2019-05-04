import { Directive, Input, ElementRef, OnInit } from '@angular/core';
import { ServerBrowserCacheService } from '../services/server-browser-cache.service';

@Directive({ selector: '[tsIcon]' })
export class TeamspeakIconDirective implements OnInit {
  @Input('tsIcon') iconId: number;

  constructor(private el: ElementRef, private scs: ServerBrowserCacheService) {}

  ngOnInit() {
    this.el.nativeElement.src = 'data:image/jpeg;base64,' + this.scs.getIcon(this.iconId).data;
  }
}
