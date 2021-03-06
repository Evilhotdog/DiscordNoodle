import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { MessageServiceService } from './message-service.service';
import { FormsModule } from '@angular/forms';
import { MessageComponent } from './message/message.component';
import { CreditsComponent } from './credits/credits.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    MessageComponent,
    CreditsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [MessageServiceService],
  bootstrap: [AppComponent]
})
export class AppModule { }
