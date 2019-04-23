import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-server-browser',
  templateUrl: './server-browser.component.html',
  styleUrls: ['./server-browser.component.scss']
})
export class ServerBrowserComponent implements OnInit {
  @Input() channels = [];
  constructor() { }

  ngOnInit() {
  }

}
