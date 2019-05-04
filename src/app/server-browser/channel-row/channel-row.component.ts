import { Component, OnInit, Input } from '@angular/core';
import { ListChannelResponse } from '../models/ListChannelResponse';
import { User } from '../models/User';

@Component({
  selector: 'channel-row',
  templateUrl: './channel-row.component.html',
  styleUrls: ['./channel-row.component.scss']
})
export class ChannelRowComponent implements OnInit {
  @Input() channelInfo: ListChannelResponse;
  @Input() users: User[] = [];
  constructor() { }

  ngOnInit() {
    console.log(this.users);
  }
}
