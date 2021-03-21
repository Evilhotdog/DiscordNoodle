import { Component, OnInit } from '@angular/core';
import { MessageServiceService } from '../message-service.service'
import { LoginUser } from '../login-user'
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username: String
  password: String
  constructor(private socketService: MessageServiceService, private router: Router) {
    this.socketService.loginSucceeded()
    .subscribe(data => {router.navigate(['/main'], {state: {
      guilds: JSON.stringify(data)
    }})})
  }
  model = new LoginUser("", "")
  ngOnInit(): void {
    
  }

  login() {
    this.socketService.login(this.model)
  }
  get diagnostic() { return JSON.stringify(this.model); }

}
