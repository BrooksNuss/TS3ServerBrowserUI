import { Injectable, ViewContainerRef } from '@angular/core';
import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { TooltipConfig } from '../shared/models/TooltipConfig';

@Injectable()
export class OverlayService {
  constructor(private overlayService: Overlay) { }
  private activeModal: OverlayRef;
  public overlayLocation: ViewContainerRef;

  createModal(component: ComponentType<any>): void {
    const config: OverlayConfig = {
      positionStrategy: this.overlayService.position().global(),
      hasBackdrop: true,
      backdropClass: 'modal-backdrop',
      panelClass: 'modal-panel',
      // scrollStrategy: this.overlayService.scrollStrategies.
    };
    this.activeModal = this.overlayService.create(config);
    const componentPortal = new ComponentPortal(component);
    this.activeModal.attach(componentPortal);
  }

  createTooltip(component: ComponentType<any>, location: ViewContainerRef): OverlayRef {
    const config: OverlayConfig = {
      positionStrategy: this.overlayService.position().flexibleConnectedTo(location.element),
    };
    const overlayRef = this.overlayService.create();
    const componentPortal = new ComponentPortal(component);
    overlayRef.attach(componentPortal);
    return overlayRef;
  }

  destroyModal(): void {
    this.activeModal.dispose();
  }
}
