import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ClientRowComponent } from './server-browser/client-row/client-row.component';
import { ServerBrowserComponent } from './server-browser/server-browser.component';
import { ChannelRowComponent } from './server-browser/channel-row/channel-row.component';
import { ServerBrowserService } from './server-browser/services/server-browser.service';
import { SocketIoModule } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';
import { ServerBrowserCacheService } from './server-browser/services/server-browser-cache.service';
import { TeamspeakIconDirective } from './server-browser/directives/teamspeak-icon.directive';
import { ServerBrowserSocketService } from './server-browser/services/server-browser-socket.service';
import { RTCService } from './services/rtc.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SidenavContentComponent } from './sidenav/sidenav-content/sidenav-content.component';

const socketConfig = {url: environment.svcUrl + ':' + environment.socketPort, options: {}};

@NgModule({
  declarations: [
    AppComponent,
    ServerBrowserComponent,
    ChannelRowComponent,
    ClientRowComponent,
    TeamspeakIconDirective,
    SidenavContentComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    SocketIoModule.forRoot(socketConfig),
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule
  ],
  providers: [
    ServerBrowserService,
    ServerBrowserCacheService,
    ServerBrowserSocketService,
    RTCService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
