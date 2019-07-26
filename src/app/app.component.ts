import { Component, ViewChild, ElementRef } from '@angular/core';
import { RTCService } from './services/rtc.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('audioElement') audioElement: ElementRef<HTMLAudioElement>;
  inputStreamTrack: MediaStreamTrack;
  inputStream: MediaStream;
  remoteConnection: RTCPeerConnection;
  title = 'ServerBrowserUI';
  audioContext: AudioContext;

  constructor(private rtcService: RTCService) {}

  initializeAudio() {
    this.audioContext = new AudioContext();
    navigator.mediaDevices.getUserMedia({audio: ({autoGainControl: false} as any), video: false}).then(stream => {
      this.inputStream = stream;
      this.inputStreamTrack = stream.getAudioTracks()[0];
      this.connectAudio();
    }, err => {
      console.log('Error getting audio input');
      console.log(err);
    });
  }

  async connectAudio() {
    this.remoteConnection = new RTCPeerConnection({
      iceServers: [{
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302'
        ]
      }]
    });
    this.rtcService.initiateConnection().subscribe((offer: RTCPeerConnection) => {
      let id = (offer as any).id;
      // set remote description
      this.remoteConnection.setRemoteDescription(offer.localDescription).then(() => {
        // add our media capabilities
        this.remoteConnection.addTrack(this.inputStreamTrack, this.inputStream);
        // create answer
        this.remoteConnection.createAnswer().then((answer: RTCSessionDescription) => {
          this.remoteConnection.setLocalDescription(answer).then(() => {
            this.rtcService.sendAnswer(id, this.remoteConnection.localDescription).subscribe(res => {
              this.remoteConnection.onconnectionstatechange = e => {
                if (this.remoteConnection.connectionState === 'connected') {
                  this.initAudioOutput();
                }
              };
              if (this.remoteConnection.connectionState === 'connected') {
                this.initAudioOutput();
              }
            });
          });
        });
      });
    });
  }

  initAudioOutput() {
      let remoteStream = new MediaStream();
      remoteStream.addTrack(this.remoteConnection.getReceivers().find(r => r.track.kind === 'audio').track);
      this.audioElement.nativeElement.srcObject = remoteStream;
      this.audioElement.nativeElement.muted = true;
      let remoteSource = this.audioContext.createMediaStreamSource(remoteStream);
      let volumeNode = this.audioContext.createGain();
      volumeNode.gain.value = 10;
      remoteSource.connect(volumeNode);
      volumeNode.connect(this.audioContext.destination);
  }

  debugPause() {
    console.log('pausing');
  }
}
