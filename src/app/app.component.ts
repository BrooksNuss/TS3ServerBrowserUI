import { Component, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { transition, state, trigger, style, animate } from '@angular/animations';
import { AudioService } from './services/audio.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('sidebarMinimize', [
      state('open', style({ width: '200px' })),
      state('closed', style({ width: '54px' })),
      transition('closed => open', [
        animate('.25s ease'),
      ]),
      transition('open => closed', [
        animate('.25s ease'),
      ])
    ]),
    trigger('sidebarMinimizeContent', [
      state('open', style({ 'margin-left': '200px' })),
      state('closed', style({ 'margin-left': '54px' })),
      transition('open <=> closed', animate('.25s ease'))
    ]),
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  // @ViewChild('audioElement') audioElement: ElementRef<HTMLAudioElement>;
  @ViewChild('sidenavContainer') sidebarContainer: MatSidenavContainer;
  @ViewChild('sidenav') sidebar: MatSidenav;
  public sidebarOpen = true;
  title = 'ServerBrowserUI';

  constructor(private audioService: AudioService) {}

  ngOnInit() {
    // this.initializeAudio();
  }

  debugPause() {
    console.log('pausing');
  }

  ngOnDestroy() {
    console.log('DESTROY');
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  initializeAudio() {
    this.audioService.initializeAudio();
  }

  closeConnection() {
    this.audioService.dataChannel.send('DISCONNECT');
  }

  muteInput() {
    this.audioService.dataChannel.send('TOGGLE_MUTE_INPUT');
  }

  muteOutput() {
    this.audioService.dataChannel.send('TOGGLE_MUTE_OUTPUT');
  }
}
