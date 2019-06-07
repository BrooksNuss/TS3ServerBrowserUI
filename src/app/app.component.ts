import { Component } from '@angular/core';
import { RTCService } from './services/rtc.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  inputStream: MediaStreamTrack;
  title = 'ServerBrowserUI';

  constructor(private rtcService: RTCService) {}

  initializeAudio() {
    navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
      this.inputStream = stream.getTracks()[0];
      this.connectAudio();
    }, err => {
      console.log('Error getting audio input');
      console.log(err);
    });
  }

  connectAudio() {
    let remoteConnection = new RTCPeerConnection({
      iceServers: [{
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302'
        ]
      }]
    });
    remoteConnection.ontrack = track => console.log(track);
    remoteConnection.addTrack(this.inputStream);
    this.rtcService.initiateConnection().subscribe((offer: RTCPeerConnection) => {
      // do something with the connection.
      let id = (offer as any).id;
      remoteConnection.setRemoteDescription(offer.localDescription);
      remoteConnection.createAnswer({offerToReceiveAudio: true}).then((answer: RTCSessionDescription) => {
        remoteConnection.setLocalDescription(answer);
        this.rtcService.sendAnswer(id, remoteConnection.localDescription).subscribe(res => {
          console.log(res);
        });
      });
    });
    // let conn = new RTCPeerConnection();
    // conn.onicecandidate = (cand) => console.log(cand);
    // conn.createOffer({offerToReceiveAudio: true}).then(offer => conn.setLocalDescription(offer));
  }
}
