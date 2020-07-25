import { Directive, Input, ElementRef, OnInit } from '@angular/core';
import { ServerBrowserCacheService } from '../services/server-browser-cache.service';

@Directive({ selector: '[tsIcon]' })
export class TeamspeakIconDirective implements OnInit {
  // private _iconId: number;
  private _icon: string;
  // @Input() set iconId(id: number) {
  //   this._iconId = id;
  //   const cachedIcon = this.scs.getIcon(this.iconId);
  //   this.el.nativeElement.src = 'data:image/jpeg;base64,' + cachedIcon ? cachedIcon.icon : '';
  // }
  // get iconId(): number {
  //   return this._iconId;
  // }
  @Input() set icon(icon: string) {
    this._icon = icon;
    if (icon) {
      this.el.nativeElement.src = 'data:image/jpeg;base64,' + this.icon;
    }
  }
  get icon(): string {
    return this._icon;
  }

  constructor(private el: ElementRef, private scs: ServerBrowserCacheService) {}

  ngOnInit() {
    // can provide icon or iconId
    // if (!this.icon) {
    //   const cachedIcon = this.scs.getIcon(this.iconId);
    //   this.el.nativeElement.src = 'data:image/jpeg;base64,' + cachedIcon ? cachedIcon.icon : '';
    // } else {
    //   this.el.nativeElement.src = 'data:image/jpeg;base64,' + this.icon;
    // }
  }
}
