import { Client } from './Client';

export class Channel {
  constructor(
    public cid: number,
    public pid?: number,
    public name?: string,
    public subChannels?: Channel[],
    public clients?: Array<Client>,
    public topic?: string,
    public description?: string,
    public passworded?: boolean,
  ) { }

  addClient(client: Client): void {
    this.clients.push(client);
  }

  removeClient(client: Client): void {
    this.clients.splice(this.clients.findIndex(c => c.clid === client.clid), 1);
  }

  addChannel(channel: Channel): void {
    this.subChannels.push(channel);
  }

  removeChannel(channel: Channel): void {
    this.subChannels.splice(this.subChannels.findIndex(c => c.cid === channel.cid), 1);
  }
}
