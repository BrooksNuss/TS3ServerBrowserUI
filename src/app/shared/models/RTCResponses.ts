export interface RTCCreateConnectionResponse {
  offer: RTCSessionDescriptionInit;
  id: string;
}

export enum TSMessageDataType {
  CONNECT = 0,
  DISCONNECT = 1,
  JOIN_CHANNEL = 2,
  TOGGLE_MUTE_INPUT = 3,
  TOGGLE_MUTE_OUTPUT = 4,
  VAD_ACTIVE = 5,
  VAD_INACTIVE = 6,
  SEND_VOICE = 7,
  RECEIVE_VOICE = 8,
  MUTE_CLIENT_LOCALLY = 9,
  TALKING_CLIENT = 10,
  CLIENT_ID = 11
}

export interface DataChannelMessage<T = string> {
  type: number;
  data: T;
}
