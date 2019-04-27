import { Component, OnInit, Input } from '@angular/core';
import { ListUserResponse } from '../models/listUserResponse';
import { ListChannelResponse } from '../models/ListChannelResponse';

@Component({
  selector: 'channel-row',
  templateUrl: './channel-row.component.html',
  styleUrls: ['./channel-row.component.scss']
})
export class ChannelRowComponent implements OnInit {
  @Input() channelInfo: ListChannelResponse;
  @Input() users: ListUserResponse[] = [];
  constructor() { }

  ngOnInit() {
    console.log(this.users);
  }
}
