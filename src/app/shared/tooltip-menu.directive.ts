import { Directive, ElementRef, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TooltipConfig } from './models/TooltipConfig';

@Directive({ selector: '[tooltip-menu]' })
export class TooltipMenuDirective implements OnInit, OnDestroy {
  @Input('tooltip-menu') overlayConfig: TooltipConfig[];
  private openEventSubject = new Subject();
  private openEventSubscription = new Subscription();
  private closeEventSubject = new Subject();
  private closeEventSubscription = new Subscription();
  private isOpen = false;
  overlayRef: OverlayRef;
  constructor(private el: ElementRef, private overlayService: Overlay) { }

  ngOnInit() {
    // TODO: foreach configuration - in case of multiple tooltip options on one element (hover vs click, etc)
    this.overlayConfig.forEach(tooltipConfig => {
      // modify position config here
      tooltipConfig.config.positionStrategy = this.overlayService.position()
        .flexibleConnectedTo(this.el);
      let element = this.el.nativeElement as HTMLElement;
      // listeners
      element[tooltipConfig.openEvent] = () => {
        this.openEventSubject.next(tooltipConfig);
      };
      element[tooltipConfig.closeEvent] = () => {
        this.closeEventSubject.next(tooltipConfig);
      };
      // delay
      this.openEventSubscription.add(this.openEventSubject.pipe(debounceTime(tooltipConfig.openDelay)).subscribe(value => {
        if (!tooltipConfig.isOpen && value) {
          this.createTooltip(tooltipConfig);
          tooltipConfig.isOpen = true;
        }
      }));
      this.closeEventSubscription.add(this.closeEventSubject.pipe(debounceTime(tooltipConfig.closeDelay)).subscribe(value => {
        if (tooltipConfig.isOpen && value) {
          this.destroyTooltip(tooltipConfig);
          tooltipConfig.isOpen = false;
        }
      }));
    });
  }

  ngOnDestroy() {
    if (this.openEventSubscription) {
      this.openEventSubscription.unsubscribe();
    }
    if (this.closeEventSubscription) {
      this.closeEventSubscription.unsubscribe();
    }
    this.overlayConfig.forEach(tooltipConfig => {
      this.el.nativeElement[tooltipConfig.openEvent] = null;
      this.el.nativeElement[tooltipConfig.closeEvent] = null;
    });
  }

  createTooltip(tooltipConfig: TooltipConfig) {
    tooltipConfig.overlayRef = this.overlayService.create();
    const componentPortal = new ComponentPortal(tooltipConfig.type);
    tooltipConfig.overlayRef.attach(componentPortal);
  }

  destroyTooltip(tooltipConfig: TooltipConfig) {
    tooltipConfig.overlayRef.dispose();
  }
}
