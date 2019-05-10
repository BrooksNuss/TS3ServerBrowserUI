import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ServerBrowserCacheService } from './server-browser-cache.service';
import { ClientConnectEventResponse, ClientDisconnectResponseEvent, ClientMovedEventResponse } from '../models/ClientEvents';

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

    socket.fromEvent('clientdisconnect').subscribe((event: ClientDisconnectResponseEvent) => {
      scs.disconnectUser(event);
    });

    socket.fromEvent('clientmoved').subscribe((event: ClientMovedEventResponse) => {
      scs.moveUser(event);
    });

    socket.on('clientmoved', (event) => {
      console.log("USER MOVED");
      console.log(event);
    });
  }

  getClientMoved() {
    return this.socket.fromEvent('clientmoved');
  }
}
