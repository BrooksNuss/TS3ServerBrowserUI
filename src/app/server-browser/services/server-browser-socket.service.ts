import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ServerBrowserCacheService } from './server-browser-cache.service';
import { ClientConnectEventResponse, ClientDisconnectEventResponse, ClientMovedEventResponse, ChannelEditEventResponse, ChannelCreateEventResponse, ChannelMovedEventResponse, ChannelDeletedEventResponse } from '../models/Events';

@Injectable()
export class ServerBrowserSocketService {
  private standardEvents = [
    'clientconnect',
    'clientdisconnect',
    'clientmoved',
    'serveredit',
    'channeledit',
    'channelcreate',
    'channelmoved',
    'channeldelete'
  ];

  constructor(private socket: Socket, private scs: ServerBrowserCacheService) {
    socket.fromEvent('clientconnect').subscribe((event: ClientConnectEventResponse) => {
      scs.connectUser(event);
    });

    socket.fromEvent('clientdisconnect').subscribe((event: ClientDisconnectEventResponse) => {
      scs.disconnectUser(event);
    });

    socket.fromEvent('clientmoved').subscribe((event: ClientMovedEventResponse) => {
      scs.moveUser(event);
    });

    socket.fromEvent('channeledit').subscribe((event: ChannelEditEventResponse) => {
      scs.editChannel(event);
    });

    socket.fromEvent('channelcreate').subscribe((event: ChannelCreateEventResponse) => {
      scs.createChannel(event);
    });

    socket.fromEvent('channelmoved').subscribe((event: ChannelMovedEventResponse) => {
      scs.moveChannel(event);
    });

    socket.fromEvent('channeldelete').subscribe((event: ChannelDeletedEventResponse) => {
      scs.deleteChannel(event);
    });
  }

  getClientMoved() {
    return this.socket.fromEvent('clientmoved');
  }
}
