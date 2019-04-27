import { Component, OnInit, Input } from '@angular/core';
import { ServerBrowserService } from './server-browser.service';
import { forkJoin } from 'rxjs';
import { ListUserResponse } from './models/listUserResponse';
import { Channel } from './models/Channel';
import { User } from './models/User';

@Component({
  selector: 'server-browser',
  templateUrl: './server-browser.component.html',
  styleUrls: ['./server-browser.component.scss']
})
export class ServerBrowserComponent implements OnInit {
  channels: Channel[] = [];
  users: User[] = [];
  constructor(private sbs: ServerBrowserService) { }

  ngOnInit() {
    const channelsReq = this.sbs.getChannelList();
    const usersReq = this.sbs.getUserList();
    forkJoin(channelsReq, usersReq).subscribe(values => {
      values[0].forEach(value => {
        this.channels.push({channelInfo: value, users: []});
      });
      values[1].forEach(user => {
        this.users.push({userInfo: user});
        this.channels.find(channel => channel.channelInfo.cid === user.cid).users.push(user);
      });
    });
  }
}
