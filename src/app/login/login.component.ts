import { Component, OnInit } from '@angular/core';
import { MessageServiceService } from '../message-service.service'
import { LoginUser } from '../login-user'
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username: String
  password: String
  constructor(private socketService: MessageServiceService) { }
  model = new LoginUser("", "")
  ngOnInit(): void {
    
  }

  login() {
    this.socketService.login(this.model)
  }
  get diagnostic() { return JSON.stringify(this.model); }

}
