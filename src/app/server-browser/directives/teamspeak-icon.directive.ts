import { Directive, Input, ElementRef, OnInit } from '@angular/core';
import { ServerBrowserCacheService } from '../services/server-browser-cache.service';

@Directive({ selector: '[tsIcon]' })
export class TeamspeakIconDirective implements OnInit {
  @Input() iconId: string;
  @Input() icon: string;

  constructor(private el: ElementRef, private scs: ServerBrowserCacheService) {}

  ngOnInit() {
    // can provide icon or iconId
    if (!this.icon) {
      this.el.nativeElement.src = 'data:image/jpeg;base64,' + this.scs.getIcon(this.iconId).data;
    } else {
      this.el.nativeElement.src = 'data:image/jpeg;base64,' + this.icon;
    }
  }
}
