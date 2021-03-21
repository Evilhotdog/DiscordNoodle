import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client'
@Injectable({
  providedIn: 'root'
})
export class MessageServiceService {

  constructor() { }
  socket;
  setupSocketConnection() {
    console.log("--connecting--")
    this.socket = io('http://localhost:3000')

    //let messageObservable = new Observable
  }
  login(loginParams) {
    console.log(loginParams)
    this.socket.emit("login", loginParams)
  }

  
}
