import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {
  dates = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  @Input()
  message

  constructor() { }
  time
  hasAttachments
  ngOnInit(): void {
    
  }
  ngOnChanges() {
    
    this.time = this.getTime()
    console.log(this.message.attachments)
    this.hasAttachments = this.message.attachments.length
  }
  getTime() {
    //Takes seconds since unix epoch and turns into human readable string
    const time = new Date(this.message.time)
    //console.log(this.message.time)
    return `${time.getHours()}:${time.getMinutes()} ${time.getDate()} ${this.dates[time.getMonth()]} ${time.getFullYear()}`
  }
}
