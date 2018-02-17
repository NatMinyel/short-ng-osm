import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { MangolModule } from 'mangol';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AppRoutingModule } from './app-routing/app-routing.module';
import {HttpModule} from "@angular/http";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    HttpModule,
    BrowserModule,
    AppRoutingModule,
    LeafletModule.forRoot()
    // BrowserAnimationsModule,
    // MangolModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
