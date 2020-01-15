import { Component, OnInit, Input } from '@angular/core';
import { ContextMenuConfig } from '../models/TooltipConfig';

@Component({
  selector: 'tooltip-context-menu',
  templateUrl: 'tooltip-context-menu.component.html',
  styleUrls: ['tooltip-context-menu.component.scss']
})

export class TooltipMenuComponent implements OnInit {
  @Input() config: ContextMenuConfig;
  constructor() { }

  ngOnInit() { }
}
