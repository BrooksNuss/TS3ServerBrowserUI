import { Directive, ElementRef, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TooltipConfig } from './models/TooltipConfig';

@Directive({ selector: '[tooltip-menu]' })
export class TooltipMenuDirective implements OnInit, OnDestroy {
  @Input('tooltip-menu') overlayConfig: TooltipConfig;
  private eventSubject = new Subject();
  private eventSubscription: Subscription;
  overlayRef: OverlayRef;
  constructor(private el: ElementRef, private overlayService: Overlay) { }

  ngOnInit() {
    // TODO: foreach configuration
    // modify position config here
    this.overlayConfig.config.positionStrategy = this.overlayService.position()
      .flexibleConnectedTo(this.el);
    let element = this.el.nativeElement as HTMLElement;
    // listeners
    if (this.overlayConfig.openEvent && this.overlayConfig.closeEvent) {
      element[this.overlayConfig.openEvent] = () => {
        this.eventSubject.next(true);
      };
      element[this.overlayConfig.closeEvent] = () => {
        this.eventSubject.next(false);
      };
    }
    // delay
    this.eventSubscription = this.eventSubject.pipe(debounceTime(this.overlayConfig.delay)).subscribe(value => {
      if (value) {
        this.createTooltip();
      } else {
        this.destroyTooltip();
      }
    });
  }

  ngOnDestroy() {
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
  }

  createTooltip() {
    this.overlayRef = this.overlayService.create();
    const componentPortal = new ComponentPortal(this.overlayConfig.type);
    this.overlayRef.attach(componentPortal);
  }

  destroyTooltip() {
    this.overlayRef.dispose();
  }
}
