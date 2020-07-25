import { AwayStatus } from '../Events';
import { ServerGroup } from './ServerGroup';
import { ChannelGroup } from './ChannelGroup';

export class Client {
  constructor(
    public clid: number,
    public cid: number,
    public databaseId: number,
    public nickname?: string,
    public serverGroupIds?: Array<number>,
    public serverGroups?: Array<ServerGroup>,
    public channelGroupId?: number,
    public channelGroup?: ChannelGroup,
    public awayStatus?: AwayStatus,
    public avatarGUID?: string,
    public avatar?: string,
  ) { }
}
