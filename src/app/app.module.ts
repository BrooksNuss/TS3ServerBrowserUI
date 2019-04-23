import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { UserRowComponent } from './server-browser/user-row/user-row.component';
import { ServerBrowserComponent } from './server-browser/server-browser.component';
import { ChannelRowComponent } from './server-browser/channel-row/channel-row.component';

@NgModule({
  declarations: [
    AppComponent,
    ServerBrowserComponent,
    ChannelRowComponent,
    UserRowComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
