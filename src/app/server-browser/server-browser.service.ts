import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListUserResponse } from './models/listUserResponse';
import { ListChannelResponse } from './models/ListChannelResponse';
@Injectable()
export class ServerBrowserService {

  private apiPath = environment.svcUrl + ':' + environment.svcPort + environment.svcApiPath;

  constructor(private http: HttpClient) { }

  getUserList(): Observable<ListUserResponse[]> {
    return this.http.get<any[]>(this.apiPath + '/users/list');
  }

  getChannelList(): Observable<ListChannelResponse[]> {
    return this.http.get<any[]>(this.apiPath + '/channels/list');
  }
}
