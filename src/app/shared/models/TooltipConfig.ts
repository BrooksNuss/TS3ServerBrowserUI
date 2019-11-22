import { OverlayConfig } from '@angular/cdk/overlay';
import { Type } from '@angular/core';

export class TooltipConfig {
  tooltips: [
    {
      type: Type<any>;
      config: OverlayConfig;
      openEvent: string;
      closeEvent?: string;
      delay?: number;
    }
  ];
}
