import { Component, ViewChild, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { RTCService } from './services/rtc.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('audioElement') audioElement: ElementRef<HTMLAudioElement>;
  inputStreamTrack: MediaStreamTrack;
  inputStream: MediaStream;
  remoteConnection: RTCPeerConnection;
  title = 'ServerBrowserUI';
  audioContext: AudioContext;
  inputVolumeNode: GainNode;
  vadNode: AudioWorkletNode;
  outputVolumeNode: GainNode;
  sendAudioNode: MediaStreamAudioDestinationNode;
  receiveAudioNode: MediaStreamAudioDestinationNode;
  trackReady = false;
  senderTrack: MediaStreamTrack;
  dataChannel: RTCDataChannel;

  constructor(private rtcService: RTCService) {}

  ngOnInit() {
    // this.initializeAudio();
  }

  initializeAudio() {
    this.audioContext = new AudioContext();
    navigator.mediaDevices.getUserMedia({audio: ({autoGainControl: false} as any), video: false}).then(stream => {
      this.inputStream = stream;
      this.inputStreamTrack = stream.getAudioTracks()[0];
      this.initAudioInput(stream);
      // this.connectAudio();
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
      this.setupDataChannel();
      // set remote description
      this.remoteConnection.setRemoteDescription(offer.localDescription).then(() => {
        // add our media capabilities
        this.remoteConnection.addTrack(this.sendAudioNode.stream.getAudioTracks()[0], this.sendAudioNode.stream);
        // create answer
        this.remoteConnection.createAnswer().then((answer: RTCSessionDescription) => {
          this.remoteConnection.setLocalDescription(answer).then(() => {
            this.rtcService.sendAnswer(id, this.remoteConnection.localDescription).subscribe(res => {
              this.trackReady = true;
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

  setupDataChannel() {
    this.remoteConnection.ondatachannel = channel => {
      this.dataChannel = channel.channel;
      this.dataChannel.onclose = () => {

      };
      this.dataChannel.onopen = () => {

      };
      this.dataChannel.onmessage = message => {

      };
    };
  }

  initAudioInput(stream: MediaStream) {
    let inputNode = this.audioContext.createMediaStreamSource(stream);
    this.inputVolumeNode = this.audioContext.createGain();
    this.sendAudioNode = this.audioContext.createMediaStreamDestination();
    this.audioContext.audioWorklet.addModule('../assets/Scripts/vad.js').then(() => {
      this.vadNode = new AudioWorkletNode(this.audioContext, 'VadProcessor', {parameterData: {sensitivity: .01, falloff: 1000}});
      this.handleVadMessage();
      inputNode.connect(this.vadNode);
      this.vadNode.connect(this.inputVolumeNode);
      // let sensitivityParam = (this.vadNode.parameters as any).get('sensitivity');
      this.inputVolumeNode.connect(this.sendAudioNode);
      this.audioElement.nativeElement.srcObject = this.sendAudioNode.stream;
      this.audioElement.nativeElement.muted = true;
      // this.sendAudioNode.connect(this.audioContext.destination);
      // this.inputVolumeNode.connect(this.audioContext.destination);
      this.connectAudio();
    });
  }

  initAudioOutput() {
    this.senderTrack = this.remoteConnection.getSenders()[0].track;
    this.remoteConnection.getSenders()[0].replaceTrack(null);
    let remoteStream = new MediaStream();
    remoteStream.addTrack(this.remoteConnection.getReceivers().find(r => r.track.kind === 'audio').track);
    // this.audioElement.nativeElement.srcObject = remoteStream;
    // this.audioElement.nativeElement.muted = true;
    // maybe do this beforehand so the user can modify it
    this.audioContext.audioWorklet.addModule('../assets/Scripts/outputInterceptor.js').then(() => {
      let outputInterceptor = new AudioWorkletNode(this.audioContext, 'OutputInterceptor');
      this.outputVolumeNode = this.audioContext.createGain();
      let remoteSource = this.audioContext.createMediaStreamSource(remoteStream);
      this.outputVolumeNode.gain.value = 1;
      remoteSource.connect(outputInterceptor);
      outputInterceptor.connect(this.outputVolumeNode);
      this.outputVolumeNode.connect(this.audioContext.destination);
    });
  }

  handleVadMessage() {
    this.vadNode.port.onmessage = msg => {
      if (this.trackReady && !this.senderTrack) {
        this.senderTrack = this.remoteConnection.getSenders()[0].track;
      }
      if (msg.data === 'activate') {
        if (this.dataChannel) {
          this.dataChannel.send('unmute');
        }
        this.remoteConnection.getSenders()[0].replaceTrack(this.senderTrack);
      } else if (msg.data === 'deactivate') {
        if (this.dataChannel) {
          this.dataChannel.send('mute');
        }
        this.remoteConnection.getSenders()[0].replaceTrack(null);
      }
    };
  }

  debugPause() {
    console.log('pausing');
  }

  ngOnDestroy() {
    console.log('DESTROY');
  }
}
