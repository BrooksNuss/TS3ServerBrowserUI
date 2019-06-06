import { Component } from '@angular/core';
import { RTCService } from './services/rtc.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ServerBrowserUI';

  constructor(private rtcService: RTCService) {}

  connectAudio() {
    let remoteConnection = this.rtcService.initiateConnection().subscribe(res => {
      // do something with the connection.
      console.log(res);
    });

  }
}
