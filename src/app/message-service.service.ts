import { Injectable } from '@angular/core';
import { observable, Observable } from 'rxjs';
import { io } from 'socket.io-client'
@Injectable({
  providedIn: 'root'
})
export class MessageServiceService {

  constructor() { }
  socket;
  setupSocketConnection() {
    //create socket.io connection from origin URL
    console.log("--connecting--")
    this.socket = io()
  }
  login(loginParams) {
    console.log(loginParams)
    this.socket.emit("login", loginParams)
  }
  loginSucceeded() {
    let observable = new Observable(observer => {
      this.socket.on("loginSucceeded", (guilds) => {
        console.log(guilds)
        observer.next(guilds)
      })
      return () => {this.socket.disconnect()}
    })
    return observable
  }
  loginFailed() {
    let observable = new Observable(observer => {
      this.socket.on("loginFailed", () => {
        observer.next()
      })
      return () => {this.socket.disconnect()}
    })
    return observable
  }
  message() {
    let observable = new Observable(observer => {
      this.socket.on("message", (message) => {
        console.log(message)
        observer.next(message)
      })
      return () => {this.socket.disconnect()}
    })
    return observable
  }
  sendMessage(message) {
    this.socket.emit("userMessage", message)
  }
  
}
