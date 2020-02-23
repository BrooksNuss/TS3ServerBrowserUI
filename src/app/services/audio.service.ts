import { Injectable } from '@angular/core';
import { RTCService } from './rtc.service';
import { DataChannelService } from './dataChannel.service';

@Injectable()
export class AudioService {
  inputStreamTrack: MediaStreamTrack;
  inputStream: MediaStream;
  remoteConnection: RTCPeerConnection;
  audioContext: AudioContext;
  inputVolumeNode: GainNode;
  vadNode: AudioWorkletNode;
  outputVolumeNode: GainNode;
  sendAudioNode: MediaStreamAudioDestinationNode;
  receiveAudioNode: MediaStreamAudioDestinationNode;
  trackReady = false;
  senderTrack: MediaStreamTrack;
  private audioElement;
  connectedToAudio = false;
  clientId: number;

  constructor(private rtcService: RTCService, private dcs: DataChannelService) {}

  initializeAudio() {
    this.audioContext = new AudioContext();
    navigator.mediaDevices.getUserMedia({audio: ({autoGainControl: false} as any), video: false}).then(stream => {
      this.audioElement = new Audio();
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
                  this.connectedToAudio = true;
                  this.initAudioOutput();
                }
              };
              if (this.remoteConnection.connectionState === 'connected') {
                this.connectedToAudio = true;
                this.initAudioOutput();
              }
            });
          });
        });
      });
    });
  }

  setupDataChannel() {
    this.remoteConnection.ondatachannel = channel => this.dcs.setDataChannel(channel.channel);
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
      this.audioElement.srcObject = this.sendAudioNode.stream;
      this.audioElement.muted = true;
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
    this.audioElement.srcObject = remoteStream;
    this.audioElement.muted = true;
    // maybe do this beforehand so the user can modify it
    this.audioContext.audioWorklet.addModule('../assets/Scripts/outputInterceptor.js').then(() => {
      // let outputInterceptor = new AudioWorkletNode(this.audioContext, 'OutputInterceptor');
      this.outputVolumeNode = this.audioContext.createGain();
      let remoteSource = this.audioContext.createMediaStreamSource(remoteStream);
      this.outputVolumeNode.gain.value = .2;
      remoteSource.connect(this.outputVolumeNode);
      // outputInterceptor.connect(this.outputVolumeNode);
      this.outputVolumeNode.connect(this.audioContext.destination);
    });
  }

  handleVadMessage() {
    this.vadNode.port.onmessage = msg => {
      if (this.trackReady && !this.senderTrack) {
        this.senderTrack = this.remoteConnection.getSenders()[0].track;
      }
      if (msg.data === 'activate') {
        this.dcs.activateVAD();
        this.remoteConnection.getSenders()[0].replaceTrack(this.senderTrack);
      } else if (msg.data === 'deactivate') {
        this.dcs.deactivateVAD();
        this.remoteConnection.getSenders()[0].replaceTrack(null);
      }
    };
  }
}
