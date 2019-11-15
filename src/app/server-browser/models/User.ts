export interface Client {
  namespace: string;
  clid: number;
  cid: number;
  client_database_id: number;
  client_nickname: string;
  client_type: number;
  client_away: number;
  client_flag_talking: number;
  client_input_muted: number;
  client_output_muted: number;
  client_input_hardware: number;
  client_output_hardware: number;
  client_talk_power: number;
  client_is_talker: number;
  client_is_priority_speaker: number;
  client_is_recording: number;
  client_is_channel_commander: number;
  client_unique_identifier: string;
  client_servergroups: Array<number>;
  client_channel_group_id: number;
  client_channel_group_inherited_channel_id: number;
  client_version: string;
  client_platform: string;
  client_idle_time: number;
  client_created: number;
  client_lastconnected: number;
  client_icon_id: number;
  client_country: string;
  connection_client_ip: string;
  serverGroupIconIds: Array<string>;
  awayStatus: AwayStatus;
  avatar: string;
  avatarGUID: string;
}

export type AwayStatus = 'ACTIVE' | 'INACTIVE' | 'AWAY' | 'OFFLINE';
