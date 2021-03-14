const express = require("express");
const path = require("path")
const Discord = require("discord.js")
const config = require("dotenv").config()
const http = require("http");
const {MongoClient} = require('mongodb');
const mongoose = require('mongoose');
const { Attachment, Message, Channel, Guild } = require("./server/schemas.js");
const e = require("express");

const app = express()
const client = new Discord.Client();
mongoose.connect(process.env.URI, {useNewUrlParser: true})
  
function updateGuilds() {
    
    const guilds = client.guilds
    let guildObjects = []
    guilds.cache.forEach(guild => {
        const categories = guild.channels.cache.filter(c => c.type=="category")
        let categoryObjects = []
        categories.forEach(category => {
            channelObjects = []
            category.children.forEach((channel) => {
                channelMessages = []
                Guild.exists({id: guild.id}).then(result => {
                    if (result) {
                    console.log("___" + category.name)
                    Guild.findOne({id: guild.id}, (err, doc) => {
                        console.log("+++"+ doc)
                        channelMessages = doc.channels.cache.filter(c => c.id == channel.id).messages
                    })}
                }) 
                channelObjects.push({
                    id: channel.id,
                    name: channel.name,
                    messages: channelMessages
                })
                
            })
            categoryObjects.push({
                id: category.id,
                name: category.name,
                channels: channelObjects
            })
            })
            guildObjects.push({
                name: guild.name,
                id: guild.id,
                categories: categoryObjects
            })
        })
        console.log(guildObjects)
        console.log(guildObjects[0].categories)
    }


client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
    updateGuilds()
});



client.on("message", (message) => {
    console.log(message.content)
    console.log(typeof(message.author))

    let mssg = new Message({author: message.author, content: message.content})
    console.log(mssg)
})


client.login(process.env.BOT_TOKEN) 


 
app.use(express.static(__dirname + "/dist/DiscordNoodle"))
app.get("/*", (req, res) => res.sendFile(path.join(__dirname)))
const server = http.createServer(app)
app.listen(process.env.PORT || 3000, 
	() => console.log("Server is running..."));