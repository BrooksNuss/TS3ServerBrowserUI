import { Injectable } from '@angular/core';
import { DataChannelMessage, TSMessageDataType } from '../shared/models/RTCResponses';

@Injectable()
export class DataChannelService {
  private dataChannel: RTCDataChannel;
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
          case TSMessageDataType.TALKING_CLIENT: console.log('talking client: ' + parsedData.data); break;
          case TSMessageDataType.CLIENT_ID: this.clientId = parseInt(parsedData.data); break;
        }
      };
    }
  }

  sendDataChannelMessage<T>(messageType: number, messageData?: T) {
    if (this.dataChannel) {
      let event: DataChannelMessage<T> = { type: messageType, data: messageData };
      this.dataChannel.send(JSON.stringify(event));
    }
  }

  // all functions for sending data to server after connecting to audio
  // basically, all user functionality. only query functionalities not handled here

  closeConnection() {
    this.sendDataChannelMessage(TSMessageDataType.DISCONNECT);
  }

  muteInput() {
    this.sendDataChannelMessage(TSMessageDataType.TOGGLE_MUTE_INPUT);
  }

  muteOutput() {
    this.sendDataChannelMessage(TSMessageDataType.TOGGLE_MUTE_OUTPUT);
  }

  activateVAD() {
    this.sendDataChannelMessage(TSMessageDataType.VAD_ACTIVE);
  }

  deactivateVAD() {
    this.sendDataChannelMessage(TSMessageDataType.VAD_INACTIVE);
  }

  joinChannel(cid: number) {
    this.sendDataChannelMessage(TSMessageDataType.JOIN_CHANNEL, cid);
  }

  muteClientLocally(cid: number) {
    this.sendDataChannelMessage(TSMessageDataType.MUTE_CLIENT_LOCALLY, cid);
  }
}
