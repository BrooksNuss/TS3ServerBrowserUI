import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListUserResponse } from '../models/listUserResponse';
import { ListChannelResponse } from '../models/ListChannelResponse';
import { ServerGroupResponse } from '../models/ServerGroupResponse';
@Injectable()
export class ServerBrowserService {

  private apiPath = environment.svcUrl + ':' + environment.svcPort + environment.svcApiPath;

  constructor(private http: HttpClient) { }

  getUserList(): Observable<ListUserResponse[]> {
    return this.http.get<ListUserResponse[]>(this.apiPath + '/users/list');
  }

  getChannelList(): Observable<ListChannelResponse[]> {
    return this.http.get<ListChannelResponse[]>(this.apiPath + '/channels/list');
  }

  getServerGroupList(): Observable<ServerGroupResponse[]> {
    return this.http.get<ServerGroupResponse[]>(this.apiPath + '/groups/server/list');
  }

  getServerGroupIconList(): Observable<any> {
    return this.http.get(this.apiPath + '/groups/server/icons/list');
  }

  getIconByServerGroup(groupId: number): Observable<any> {
    return this.http.get<any[]>(this.apiPath + '/groups/server/icons/' + groupId);
  }
}
