import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ServerBrowserCacheService } from './server-browser-cache.service';
import { ClientConnectEvent, ClientDisconnectEvent, ClientMovedEvent, ChannelEditEvent, ChannelCreateEvent, ChannelMovedEvent, ChannelDeletedEvent, ClientUpdateEvent, ClientStatusEvent } from '../models/Events';

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
    socket.fromEvent('clientconnect').subscribe((event: ClientConnectEvent) => {
      scs.connectUser(event);
    });

    socket.fromEvent('clientdisconnect').subscribe((event: ClientDisconnectEvent) => {
      scs.disconnectUser(event);
    });

    socket.fromEvent('clientmoved').subscribe((event: ClientMovedEvent) => {
      scs.moveUser(event);
    });

    socket.fromEvent('channeledit').subscribe((event: ChannelEditEvent) => {
      scs.editChannel(event);
    });

    socket.fromEvent('channelcreate').subscribe((event: ChannelCreateEvent) => {
      scs.createChannel(event);
    });

    socket.fromEvent('channelmoved').subscribe((event: ChannelMovedEvent) => {
      scs.moveChannel(event);
    });

    socket.fromEvent('channeldelete').subscribe((event: ChannelDeletedEvent) => {
      scs.deleteChannel(event);
    });

    // socket.fromEvent('clientupdate').subscribe((event: ClientUpdateEvent) => {
    //   this.scs.updateClient(event);
    // });

    socket.fromEvent('clientstatus').subscribe((event: ClientStatusEvent) => {
      this.scs.updateClientStatus(event);
    });
  }

  getClientMoved() {
    return this.socket.fromEvent('clientmoved');
  }
}
