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
async function find(guild, channel) {
    Guild.findOne({guild_id: guild.id}).then(doc => {
        console.log("+++"+ doc)
        if (doc) {
        return doc.channels.filter(c => c.id == channel.id).messages
        } else {return [{author: "SYSTEM", message: "Welcome to DiscordNoodle! This marks the beginning of where Noodle has recorded messages"}]}
    }
) 
}

async function rm(guild) {
    await Guild.deleteOne({id: guild.id}, (err) => {if (err) return err})
    let gld = new Guild(guild)
    console.log(gld.categories[0].channels[0].messages)
    await gld.save()
    return 0
}
function updateGuilds() {
    
    const guilds = client.guilds
    let guildObjects = []
    guilds.cache.forEach(guild => {
        const categories = guild.channels.cache.filter(c => c.type=="category")
        let categoryObjects = []
        categories.forEach(category => {
            let channelObjects = []
            category.children.forEach((channel) => {
                console.log(guild.id)
                
                console.log("___" + category.name)
                let channelMessages = find(guild, channel)
                console.log("Channel messages")
                console.log(channelMessages)
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
                guild_id: guild.id,
                categories: categoryObjects
            })
        })
        guildObjects.forEach(guild => {
            let x = rm(guild)
        })
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