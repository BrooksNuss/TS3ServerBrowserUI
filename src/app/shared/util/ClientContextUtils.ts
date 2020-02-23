import { Client } from 'src/app/server-browser/models/Client';
import { DataChannelService } from 'src/app/services/dataChannel.service';
import { ContextMenuConfig } from '../models/TooltipConfig';

export function ClientContextFactory(dcs: DataChannelService, client: Client): ContextMenuConfig {
  return {
    menuItems: [
      {
        text: 'Open text chat',
        action: () => {}
      },
      {
        text: 'Mute client',
        action: () => dcs.muteClientLocally(client.cid)
      }
    ]
  };
}
