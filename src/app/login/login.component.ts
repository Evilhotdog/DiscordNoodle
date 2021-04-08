import { Component, OnInit } from '@angular/core';
import { MessageServiceService } from '../message-service.service'
import { LoginUser } from '../login-user'
import { Router } from '@angular/router';
import { formatCurrency } from '@angular/common';
import { NgForm } from '@angular/forms';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username: String
  password: String
  rejected: boolean = false
  constructor(private socketService: MessageServiceService, private router: Router) {
    this.socketService.loginSucceeded()
    .subscribe(data => {router.navigate(['/main'], {state: {
      guilds: JSON.stringify(data)
    }})})
    this.socketService.loginFailed()
    .subscribe(() => {
      this.rejected = true

    })
  }
  
  model = new LoginUser("", "")
  ngOnInit(): void {
    
  }

  login(form: NgForm) {
    this.socketService.login(this.model)
    form.resetForm()
  }
  get diagnostic() { return JSON.stringify(this.model); }

}
