export interface ListChannelResponse {
  namespace: string;
  cid: number;
  pid: number;
  channel_order: number;
  channel_name: string;
  channel_flag_default: number;
  channel_flag_password: number;
  channel_flag_permanent: number;
  channel_flag_semi_permanent: number;
  channel_codec: number;
  channel_codec_quality: number;
  channel_needed_talk_power: number;
  channel_icon_id: number;
  seconds_empty: number;
  total_clients_family: number;
  channel_maxclients: number;
  channel_maxfamilyclients: number;
  total_clients: number;
  channel_needed_subscribe_power: number;
}
