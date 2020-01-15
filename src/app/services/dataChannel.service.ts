import { Injectable } from '@angular/core';
import { DataChannelMessage } from '../server-browser/models/Events';

@Injectable()
export class DataChannelService {
  private dataChannel: RTCDataChannel;
  private active = false;
  public clientId: number;
  constructor() { }

  public setDataChannel(dataChannel: RTCDataChannel) {
    this.dataChannel = dataChannel;
    this.setupDataChannel(dataChannel);
  }

  private setupDataChannel(dataChannel: RTCDataChannel) {
    {
      this.dataChannel = dataChannel;
      this.dataChannel.onclose = () => {

      };
      this.dataChannel.onopen = () => {
        window.onbeforeunload = () => {
          this.closeConnection();
          return null;
        };
      };
      this.dataChannel.onmessage = message => {
        let parsedData: DataChannelMessage = JSON.parse(message.data);
        switch (parsedData.type) {
          case 'TALKING_CLIENT': console.log('talking client: ' + parsedData.data); break;
          case 'CLIENT_ID': this.clientId = parseInt(parsedData.data); break;
        }
      };
    }
  }

  public setActive(active: boolean) {
    this.active = active;
  }

  sendDataChannelMessage<T>(messageType: string, messageData?: T) {
    if (this.active && this.dataChannel) {
      let event: DataChannelMessage<T> = { type: messageType, data: messageData };
      this.dataChannel.send(JSON.stringify(event));
    }
  }

  // all functions for sending data to server after connecting to audio
  // basically, all user functionality. only query functionalities not handled here

  closeConnection() {
    this.sendDataChannelMessage('DISCONNECT');
  }

  muteInput() {
    this.sendDataChannelMessage('TOGGLE_MUTE_INPUT');
  }

  muteOutput() {
    this.sendDataChannelMessage('TOGGLE_MUTE_OUTPUT');
  }

  activateVAD() {
    this.sendDataChannelMessage('VAD_ACTIVE');
  }

  deactivateVAD() {
    this.sendDataChannelMessage('VAD_INACTIVE');
  }

  joinChannel(cid: number) {
    this.sendDataChannelMessage('JOINCHANNEL', cid);
  }

  muteClientLocally(cid: number) {
    this.sendDataChannelMessage('MUTE_CLIENT_LOCAL', cid);
  }
}
