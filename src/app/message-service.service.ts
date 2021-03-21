import { Injectable } from '@angular/core';
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
  }
  login(loginParams) {
    console.log(loginParams)
    this.socket.emit("login", loginParams)
  }
}
