import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServerGroupResponse } from '../models/ServerGroupResponse';
import { ChannelGroupResponse } from '../models/ChannelGroupResponse';
import { Client } from '../models/User';
import { ChannelResponse } from '../models/ChannelResponse';
import { ServerBrowserLookup } from '../models/Lookup';
import { ClientAvatarCache } from '../models/AvatarCacheModel';
@Injectable()
export class ServerBrowserService {

  private apiPath = environment.svcUrl + ':' + environment.svcPort + environment.svcApiPath;

  constructor(private http: HttpClient) { }

  getUserList(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiPath + '/users/list');
  }

  getChannelList(): Observable<ChannelResponse[]> {
    return this.http.get<ChannelResponse[]>(this.apiPath + '/channels/list');
  }

  getServerGroupList(): Observable<ServerGroupResponse[]> {
    return this.http.get<ServerGroupResponse[]>(this.apiPath + '/groups/server/list');
  }

  getChannelGroupList(): Observable<ChannelGroupResponse[]> {
    return this.http.get<ChannelGroupResponse[]>(this.apiPath + '/groups/channel/list');
  }

  getLookup(): Observable<ServerBrowserLookup> {
    return this.http.get<ServerBrowserLookup>(this.apiPath + '/lookup');
  }

  getClientAvatars(clientDBIdList: number[]): Observable<ClientAvatarCache[]> {
    return this.http.post<ClientAvatarCache[]>(this.apiPath + '/users/avatar', clientDBIdList);
  }
}
