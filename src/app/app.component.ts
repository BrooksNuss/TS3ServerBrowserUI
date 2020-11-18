import { Component, ViewChild, OnDestroy, OnInit, ViewContainerRef, AfterViewInit } from '@angular/core';
import { MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { transition, state, trigger, style, animate } from '@angular/animations';
import { AudioService } from './services/audio.service';
import { DataChannelService } from './services/dataChannel.service';
import { OverlayService } from './services/overlay.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

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
  @ViewChild('sidenavContainer', { static: true }) sidebarContainer: MatSidenavContainer;
  @ViewChild('sidenav', { static: true }) sidebar: MatSidenav;
  @ViewChild('overlayLocation', { read: ViewContainerRef, static: true }) overlayLocation: ViewContainerRef;
  public sidebarOpen = true;
  title = 'ServerBrowserUI';

  constructor(
    private audioService: AudioService,
    private dcs: DataChannelService,
    private overlayService: OverlayService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    iconRegistry.addSvgIcon('channel-subscribed', sanitizer.bypassSecurityTrustResourceUrl('../assets/svg/channel_green_subscribed.svg'));
  }

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
