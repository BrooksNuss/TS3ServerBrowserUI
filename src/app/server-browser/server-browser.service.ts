import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable()
export class ServerBrowserService {

  private apiPath = environment.svcUrl + ':' + environment.svcPort + environment.svcApiPath;

  constructor(private http: HttpClient) { }

  getUserList(): Observable<any[]> {
    return this.http.get<any[]>(this.apiPath + '/users/list');
  }

  getChannelList(): Observable<any[]> {
    return this.http.get<any[]>(this.apiPath + '/channels/list');
  }
}
