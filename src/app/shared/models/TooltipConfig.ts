import { OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { Type } from '@angular/core';

export class TooltipConfig {
  type: Type<any>;
  config: OverlayConfig;
  openEvent: string;
  closeEvent?: string;
  openDelay = 1000;
  closeDelay = 500;
  overlayRef: OverlayRef;
  isOpen = false;
  componentConfig: TooltipComponentConfig;
}

export interface TooltipComponentConfig {

}

export class ContextMenuConfig implements TooltipComponentConfig {
  menuItems: ContextMenuItem[];
}

export class ContextMenuItem {
  action: () => void;
  text: string;
  icon?: string;
}
