import { Component, OnInit } from '@angular/core';
import { MessageServiceService } from './message-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'DiscordNoodle';

  constructor(private socketService: MessageServiceService) {}
  ngOnInit() {
    alert("preparing to connect")
    this.socketService.setupSocketConnection();
    
  }

}
