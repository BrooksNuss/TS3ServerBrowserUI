import { Component } from '@angular/core';
import { RTCService } from './services/rtc.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  inputStreamTrack: MediaStreamTrack;
  inputStream: MediaStream;
  remoteConnection: RTCPeerConnection;
  title = 'ServerBrowserUI';
  audioContext: AudioContext;

  constructor(private rtcService: RTCService) {}

  initializeAudio() {
    this.audioContext = new AudioContext();
    navigator.mediaDevices.getUserMedia({audio: {autoGainControl: false} as any}).then(stream => {
      this.inputStream = stream;
      this.inputStreamTrack = stream.getTracks()[0];
      this.connectAudio();
    }, err => {
      console.log('Error getting audio input');
      console.log(err);
    });
  }

  connectAudio() {
    this.remoteConnection = new RTCPeerConnection({
      iceServers: [{
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302'
        ]
      }]
    });
    this.remoteConnection.addTrack(this.inputStreamTrack);
    this.rtcService.initiateConnection().subscribe((offer: RTCPeerConnection) => {
      let id = (offer as any).id;
      // set remote description
      this.remoteConnection.setRemoteDescription(offer.localDescription).then(() => {
        // modify transceiver
        // let transceiver = this.remoteConnection.getTransceivers()[0];
        // transceiver.direction = 'sendrecv';
        // transceiver.sender.replaceTrack(this.inputStream).then(track => {
        // create answer
        this.remoteConnection.createAnswer().then((answer: RTCSessionDescription) => {
          this.remoteConnection.setLocalDescription(answer);
          this.rtcService.sendAnswer(id, this.remoteConnection.localDescription).subscribe(res => {
            console.log(res);
            console.log(this.remoteConnection);
            this.remoteConnection.onconnectionstatechange = e => {
              console.log(e);
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
  }

  initAudioOutput() {
    let remoteStream = new MediaStream();
    remoteStream.addTrack(this.remoteConnection.getReceivers()[0].track);
    let remoteSource = this.audioContext.createMediaStreamSource(remoteStream);
    // let localSource = this.audioContext.createMediaStreamSource(this.inputStream);
    let volumeNode = this.audioContext.createGain();
    volumeNode.gain.value = 1;
    remoteSource.connect(volumeNode);
    // localSource.connect(volumeNode);
    volumeNode.connect(this.audioContext.destination);
  }

  debugPause() {
    console.log('pausing');
  }
}
