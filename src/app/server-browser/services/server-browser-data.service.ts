import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/business/Client';
import { AvatarListRequest } from '../models/AvatarListRequest';
import { AvatarListResponse } from '../models/AvatarListResponse';
import { ServerGroupResponse, ChannelGroupResponse, ChannelResponse, ServerBrowserLookupResponse } from '../models/response/Responses';
@Injectable()
export class ServerBrowserDataService {

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

  getLookup(): Observable<ServerBrowserLookupResponse> {
    return this.http.get<ServerBrowserLookupResponse>(this.apiPath + '/lookup');
  }

  getClientAvatars(clientDBIdList: AvatarListRequest): Observable<AvatarListResponse> {
    return this.http.post<AvatarListResponse>(this.apiPath + '/users/avatar', clientDBIdList);
  }
}
