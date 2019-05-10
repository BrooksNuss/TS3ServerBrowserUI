import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { UserRowComponent } from './server-browser/user-row/user-row.component';
import { ServerBrowserComponent } from './server-browser/server-browser.component';
import { ChannelRowComponent } from './server-browser/channel-row/channel-row.component';
import { ServerBrowserService } from './server-browser/services/server-browser.service';
import { SocketIoModule } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';
import { ServerBrowserCacheService } from './server-browser/services/server-browser-cache.service';
import { TeamspeakIconDirective } from './server-browser/directives/teamspeak-icon.directive';
import { ServerBrowserSocketService } from './server-browser/services/server-browser-socket.service';

const socketConfig = {url: environment.svcUrl + ':' + environment.socketPort, options: {}};

@NgModule({
  declarations: [
    AppComponent,
    ServerBrowserComponent,
    ChannelRowComponent,
    UserRowComponent,
    TeamspeakIconDirective
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    SocketIoModule.forRoot(socketConfig)
  ],
  providers: [
    ServerBrowserService,
    ServerBrowserCacheService,
    ServerBrowserSocketService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
