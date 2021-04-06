import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageServiceService } from "../message-service.service"
import { UserMessage } from '../user-message';

@Component({
  
  selector: 'app-main',
  templateUrl: './main.component.html', 

  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  userMessageContent: String
  userMessageAttachments
  model = new UserMessage("", [])


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
      //console.log("----")
      //console.log(guilds)
      //console.log(message)
      //console.log("----")

      let guildIndex = guilds.findIndex(guild => guild.guild_id == message.guild_id)
      if (message.category_id){
        //alert(message.content)
        //alert(guildIndex)
        //alert(guilds)
        
        let categoryIndex = guilds[guildIndex].categories.findIndex(category => category.category_id == message.category_id)
        //console.log("***"+categoryIndex)
        let channelIndex = guilds[guildIndex].categories[categoryIndex].channels.findIndex(channel => channel.channel_id == message.channel_id)
        this.data.guilds[guildIndex].categories[categoryIndex].channels[channelIndex].messages.push(message)
      } else {
        let channelIndex = guilds[guildIndex].freeChannels.findIndex(channel => channel.channel_id == message.channel_id)
        this.data.guilds[guildIndex].freeChannels[channelIndex].messages.push(message)
      }
    })
    //console.log("Constructor finished")
  }

  ngOnInit(): void {
  }
  //trackBy functions
  trackByGuildId(index: number, guild: any): string {
    return guild._id;
  }
  trackByChannelId(index: number, channel: any): string {
    return channel._id;
  }
  trackByCategoryId(index: number, category: any): string {
    return category._id
  }
  trackByMessageId(index: number, message: any): string {
    return message.message_id
  }
  open: boolean;
  change: boolean;
  //Calls when button is clicked on mobile. 
  public whenClick() {
    this.open = !this.open;
    
    this.change = !this.change;
    }
  public currentGuild;
  public currentCategories;
  public currentFreeChannels;
  public currentChannel;
  public currentCategory = null;
  public guildClick(guild_id: string) {
    this.currentGuild = this.data.guilds.find((guild) => guild.guild_id == guild_id)
    //console.log(this.currentGuild)
    this.currentCategories = this.currentGuild.categories
    //alert(this.currentCategories)
    this.currentFreeChannels = this.currentGuild.freeChannels
    //alert(this.currentFreeChannels)
  }
  public channelClick(channel_id: string, hasCategory: boolean, category_id: string = "0") {
    //close sidebar and place button on left hand side (only relevant on mobile)
    this.open = false
    this.change = false
    if (hasCategory) {
      //console.log(category_id)
      this.currentCategory = this.currentCategories.find((category) => category.category_id == category_id)
      
      this.currentChannel = this.currentCategory.channels.find((channel) => channel.channel_id == channel_id)
      
    } else {
      this.currentChannel = this.currentFreeChannels.find((channel) => channel.channel_id == channel_id)
    }
    //alert(this.currentChannel)
  }
  public sendMessage(form: NgForm) {
    //sends message and empties message box if user is typing into a channel and the box is not empty. 
    if (this.model.message && this.currentChannel) {
    this.socketService.sendMessage({message: this.model, channel: this.currentChannel.channel_id, guild: this.currentGuild.guild_id})
    form.resetForm()
    }
  }
}
