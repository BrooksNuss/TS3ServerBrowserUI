import { Component, ViewChild, OnDestroy, OnInit, ViewContainerRef, AfterViewInit } from '@angular/core';
import { MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { transition, state, trigger, style, animate } from '@angular/animations';
import { AudioService } from './services/audio.service';
import { DataChannelService } from './services/dataChannel.service';
import { OverlayService } from './services/overlay.service';

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
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  // @ViewChild('audioElement') audioElement: ElementRef<HTMLAudioElement>;
  @ViewChild('sidenavContainer') sidebarContainer: MatSidenavContainer;
  @ViewChild('sidenav') sidebar: MatSidenav;
  @ViewChild('overlayLocation', { read: ViewContainerRef }) overlayLocation: ViewContainerRef;
  public sidebarOpen = true;
  title = 'ServerBrowserUI';

  constructor(private audioService: AudioService, private dcs: DataChannelService, private overlayService: OverlayService) {}

  ngOnInit() {
    // this.initializeAudio();
  }

  ngAfterViewInit() {
    this.overlayService.overlayLocation = this.overlayLocation;
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
    this.dcs.closeConnection();
  }

  muteInput() {
    this.dcs.muteInput();
  }

  muteOutput() {
    this.dcs.muteOutput();
  }
}
