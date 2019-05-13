import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServerGroupResponse } from '../models/ServerGroupResponse';
import { ChannelGroupResponse } from '../models/ChannelGroupResponse';
import { UserResponse } from '../models/UserResponse';
import { ChannelResponse } from '../models/ChannelResponse';
@Injectable()
export class ServerBrowserService {

  private apiPath = environment.svcUrl + ':' + environment.svcPort + environment.svcApiPath;

  constructor(private http: HttpClient) { }

  getUserList(): Observable<UserResponse[]>{
    return this.http.get<UserResponse[]>(this.apiPath + '/users/list');
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
}