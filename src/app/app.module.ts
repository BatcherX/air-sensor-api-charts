import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { ChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { appRoutes } from './app.routes';
import { RouterModule, Routes } from '@angular/router';
import { TodayMinutesComponent } from './today/today-minutes/today-minutes.component';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    TodayMinutesComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    ChartsModule,
    FormsModule,
    RouterModule.forRoot(appRoutes, {useHash: true})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
