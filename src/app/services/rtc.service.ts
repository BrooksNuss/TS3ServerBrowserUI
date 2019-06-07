import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class RTCService {
  private apiPath = environment.svcUrl + ':' + environment.svcPort + environment.svcApiPath;

  constructor(private http: HttpClient) { }

  initiateConnection() {
    return this.http.post(this.apiPath + '/rtc/connections', null);
  }

  sendAnswer(id: string, localDesc: RTCSessionDescription) {
    return this.http.post(this.apiPath + '/rtc/connections/' + id + '/remote-description', localDesc);
  }
}
