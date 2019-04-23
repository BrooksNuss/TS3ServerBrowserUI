import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-channel-row',
  templateUrl: './channel-row.component.html',
  styleUrls: ['./channel-row.component.scss']
})
export class ChannelRowComponent implements OnInit {
  @Input() channelInfo: Array<any> = [];
  constructor() { }

  ngOnInit() {
  }

}
