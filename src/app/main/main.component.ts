import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageServiceService } from "../message-service.service"
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  btn: Element = document.getElementById("btn")
  container: Element = document.getElementById("container")
  data: any = {};
  routeState: any
  constructor(private socketService: MessageServiceService, private router: Router) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.routeState = this.router.getCurrentNavigation().extras.state;
      
      if (this.routeState) {
        console.log(this.routeState)
        this.data.guilds = JSON.parse(this.routeState.guilds)
        console.log(this.data.guilds)
      }
    }
    this.socketService.message()
    .subscribe((message: any)=>{
      console.log(message)
      console.log(2)
      let guilds = this.data.guilds
      let guildIndex = guilds.findIndex(guild => guild.guild_id == message.guild_id)
      if (message.category_id){
        let categoryIndex = guilds[guildIndex].categories.findIndex(category => category.category_id == message.category_id).find
        let channelIndex = guilds[guildIndex].categories[categoryIndex].channels.findIndex(channel => channel.channel_id == message.channel_id)
        this.data.guilds[guildIndex].categories[categoryIndex].channels[channelIndex].messages.push(message)
      } else {
        let channelIndex = guilds[guildIndex].freeChannels.findIndex(channel => channel.channel_id == message.channel_id)
        this.data.guilds[guildIndex].freeChannels[channelIndex].messages.push(message)
      }
    })
    console.log("Constructor finished")
  }

  ngOnInit(): void {
  }
  trackByGuildId(index: number, guild: any): string {
    return guild._id
  }
  open: boolean;
  change: boolean;
  public whenClick() {
    this.open = !this.open
    
    this.change = !this.change
    }
  public guildClick(guild_id) {

  }
}
