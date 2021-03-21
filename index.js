const express = require("express");
const path = require("path")
const Discord = require("discord.js")
const config = require("dotenv").config()
const http = require("http");
const bcrypt = require("bcrypt")
const mongoose = require('mongoose');
const {User, Attachment, Message, Channel, Guild } = require("./server/schemas.js");
//const { servicesVersion } = require("typescript");
const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server, {cors: {
    origins: ["http://localhost:3200"]
}});

async function findUser(username) {
    return User.findOne({username: username}, (err, user) => {
        if (err) throw err;
        return user
    })

}

io.on("connection", (socket) => {
    console.log("Connected")
    socket.emit("testevent", "hello")
    socket.on('disconnect', () => {
        console.log('user disconnected');
      });
    socket.on("login", (arg) => {
        console.log("Connected")
        socket.emit("testevent", "hello")
        console.log(arg)
        findUser(arg.username).then((user) => {
            console.log("++" + arg.password)
            console.log("__" + user.password)
            bcrypt.compare(arg.password, user.password, (err, result) => {
                if (err) throw err
                
                if (result) {
                    //send initial DB result
                    Guild.find({}).then((guilds) => {
                        guilds = guilds.filter((guild) => user.guilds.includes(guild.guild_id))
                    socket.emit("loginSucceeded", guilds)
                    })
                    //join guild rooms
                    for (guild of user.guilds) {

                        socket.join(guild)
                    }
                    
                    

                } else {
                    socket.emit("loginFailed")
                }
            })
        })
    })
})




const client = new Discord.Client();
mongoose.connect(process.env.URI, {useNewUrlParser: true})

async function findGuilds() {

    return Guild.find({}, (err, guild) => {
        console.log("found")
        if (err) throw err
        Guild.deleteMany({}, (err) => {
            return guild
        })
        
    })
}


function updateGuilds() {
    
    const guilds = client.guilds
    let guildObjects = []
    findGuilds().then((dbGuilds) => {
        console.log(dbGuilds)

    guilds.cache.forEach((guild) => {
        let freeChannelObjects = []
        const freeChannels = guild.channels.cache.filter(c => c.type === "text" && !(c.parent))
        freeChannels.forEach(channel => {
            let channelMessages = [{author: "SYSTEM", content: "Welcome to DiscordNoodle! This marks the beginning of where Noodle has recorded messages"}]
            let dbGuild = dbGuilds.find(dbGuild => dbGuild.guild_id == guild.id)
            if(dbGuild) {
                let dbChannel = dbGuild.freeChannels.find(freeChannel => freeChannel.channel_id == channel.id)
                if (dbChannel) {
                channelMessages = dbChannel.messages
                }
            }
            freeChannelObjects.push({
                channel_id: channel.id,
                name: channel.name,
                messages: channelMessages
            }) 
        })
        const categories = guild.channels.cache.filter(c => c.type === "category")
        let categoryObjects = []
        categories.forEach(category => {
            let channelObjects = []
            category.children.forEach((channel) => {
                let channelMessages = [{author: "SYSTEM", content: "Welcome to DiscordNoodle! This marks the beginning of where Noodle has recorded messages"}]
                let dbGuild = dbGuilds.find(dbGuild => dbGuild.guild_id == guild.id)
                if(dbGuild) {
                    let dbCategory = dbGuild.categories.find(dbCategory => dbCategory.category_id == category.id)
                    if (dbCategory) {
                        let dbChannel = dbCategory.channels.find(dbChannel => dbChannel.channel_id == channel.id)
                        if (dbChannel) {
                            channelMessages = dbChannel.messages
                        }
                    }
                }
                console.log("Channel messages")
                console.log(channelMessages)
                channelObjects.push({
                    channel_id: channel.id,
                    name: channel.name,
                    messages: channelMessages
                }) 
            })
            categoryObjects.push({
                category_id: category.id,
                name: category.name,
                channels: channelObjects
            })
        }) 
        
        guildObjects.push({
            guild_id: guild.id,
            name: guild.name,
            categories: categoryObjects,
            freeChannels: freeChannelObjects
        })       
        
    })
    guildObjects.forEach(guild => {
        let guildToSave = new Guild(guild)
        guildToSave.save()
    })
})
    }


client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
    updateGuilds()
});

client.on("guildCreate", () => {
    updateGuilds()
})
client.on("guildDelete", () => {
    updateGuilds()
})

client.on("message", (message) => {
    if (message.content.startsWith("!register")) {
        if (!(message.channel.type == "dm")) {
            message.channel.send("Don't send those in servers!")
            message.delete()
            return
        }
        const args = message.content.trim().split(' ');
        if (args.length === 4) {
            const username = args[1]
            const password = args[2]
            const passwordConfirm = args[3]
            if (password == passwordConfirm) {
                client.guilds.cache.forEach((guild) => {
                    guild.members.fetch()
                    console.log(guild)
                })
                
                const userGuilds = [...client.guilds.cache.filter(guild => guild.members.cache.has(message.author.id)).values()].map((guild) => guild.id)
                console.log("User guilds")
                console.log(userGuilds)
                bcrypt.hash(password, 12, (err, hash) => {
                    console.log(hash)
                    bcrypt.compare(password, hash).then((result)=>{console.log(result)})
                    const userToSave = new User({username: username, password: hash, guilds: userGuilds, user_id: message.author.id})
                    userToSave.save((err) => {if(err) throw err; console.log("Saved")})
                })
            } else {
                message.channel.send("The password and password confirmation did not match!")
                return
            }
        } else if (args.length < 4 ) {
            message.channel.send("You didn't provide enough arguments!")
        } else {
            message.channel.send("You provided too many arguments!")
        }
        
        

    } else {
        if (message.guild) {
    let mssg = new Message({author: message.author, content: message.content})
    console.log(mssg)
    let emitMssg = {...mssg, ...{guild_id: message.guild.id, channel_id: message.channel.id}}
    console.log(message.channel)
    if (message.channel.parent) {
        emitMssg = {...emitMssg, ...{category_id: message.channel.parentID}}
    }
    io.in(message.guild.id).emit("message", emitMssg)
    Guild.findOne({guild_id: message.guild.id}, (err, guild) => {
        if (message.channel.parent) {
            console.log(guild.categories)
            console.log(message.channel.parentID)
            let categoryIndex = guild.categories.findIndex((category) => category.category_id == message.channel.parentID)
            let channelIndex = guild.categories[categoryIndex].channels.findIndex((channel) => channel.channel_id == message.channel.id)
            guild.categories[categoryIndex].channels[channelIndex].messages.push(mssg)
            
        } else {
            let channelIndex = guild.freeChannels.findIndex((channel) => channel.channel_id == message.channel.id)
            guild.freeChannels[channelIndex].messages.push(mssg)
        }
        guild.save()
    })

    }
}
})


client.login(process.env.BOT_TOKEN) 


 
app.use(express.static(__dirname + "/dist/DiscordNoodle"))
app.get("/*", (req, res) => res.sendFile(path.join(__dirname)))





server.listen(process.env.PORT || 3000, 
	() => console.log("Server is running..."));