import { ServerGroup } from './ServerGroup';

export interface ServerGroupResponse {
  group: ServerGroup;
  // base64 encoded image string
  icon: string;
}
