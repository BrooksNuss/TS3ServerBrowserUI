import { Component, OnInit, Input } from '@angular/core';
import { ServerBrowserService } from './server-browser.service';
import TeamSpeakClient from 'ts3-nodejs-library/property/Client';
import TeamSpeakChannel from 'ts3-nodejs-library/property/Channel';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'server-browser',
  templateUrl: './server-browser.component.html',
  styleUrls: ['./server-browser.component.scss']
})
export class ServerBrowserComponent implements OnInit {
  channels = [];
  users = [];
  constructor(private sbs: ServerBrowserService) { }

  ngOnInit() {
    const channelsReq = this.sbs.getChannelList();
    const usersReq = this.sbs.getUserList();
    forkJoin(channelsReq, usersReq).subscribe(values => {
      this.channels = values[0];
      this.users = values[1];
      // temporary code until response models are made
      this.channels.forEach(channel => {
        channel.users = [];
      });
      this.users.forEach(user => {
        this.channels.find(channel => channel.cid === user.cid).users.push(user);
      });
    });
  }
}
