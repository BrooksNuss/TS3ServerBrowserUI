import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ServerBrowserCacheService } from './server-browser-cache.service';
import { mapResponseToClient, mapResponseToChannel } from 'src/app/shared/util/ResponseMappers';
import { ClientResponse, ChannelResponse, ClientStatusResponse } from '../models/response/Responses';

@Injectable()
export class ServerBrowserSocketService {
  // private standardEvents = [
  //   'clientconnect',
  //   'clientdisconnect',
  //   'clientmoved',
  //   'serveredit',
  //   'channeledit',
  //   'channelcreate',
  //   'channelmoved',
  //   'channeldelete'
  // ];

  constructor(private socket: Socket, private scs: ServerBrowserCacheService) {
    socket.fromEvent('clientconnect').subscribe((event: ClientResponse) => {
      let client = mapResponseToClient(event);
      scs.connectUser(client);
    });

    socket.fromEvent('clientdisconnect').subscribe((event: ClientResponse) => {
      let cfid = event.cfid;
      let client = mapResponseToClient(event);
      scs.disconnectUser(client);
    });

    socket.fromEvent('clientmoved').subscribe((event: ClientResponse) => {
      let client = mapResponseToClient(event);
      scs.moveUser(client);
    });

    socket.fromEvent('channeledit').subscribe((event: ChannelResponse) => {
      let channel = mapResponseToChannel(event);
      scs.editChannel(channel);
    });

    socket.fromEvent('channelcreate').subscribe((event: ChannelResponse) => {
      let channel = mapResponseToChannel(event);
      scs.createChannel(channel);
    });

    socket.fromEvent('channelmoved').subscribe((event: ChannelResponse) => {
      let channel = mapResponseToChannel(event);
      scs.moveChannel(channel);
    });

    socket.fromEvent('channeldelete').subscribe((event: ChannelResponse) => {
      let channel = mapResponseToChannel(event);
      scs.deleteChannel(channel);
    });

    // socket.fromEvent('clientupdate').subscribe((event: ClientUpdateEvent) => {
    //   this.scs.updateClient(event);
    // });

    socket.fromEvent('clientstatus').subscribe((event: ClientStatusResponse) => {
      this.scs.updateClientStatus(event.clients);
    });
  }

  getClientMoved() {
    return this.socket.fromEvent('clientmoved');
  }
}
