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

function findFiletype (attachment) {
    //takes attachment and return filetype as image or video based on Discord CDN URI
        console.log(attachment)
        switch (path.extname(attachment.url)) {
            case ".png":
            case ".jpg":
                return "image"
            case ".mov":
            case ".mp4":
                return "video"
            default:
                return "unsupported"
        }
    
}

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
    let username = ""
    


    socket.on("login", (arg) => {
        //console.log("Connected")
        //socket.emit("testevent", "hello")
        //console.log(arg)
        username = arg.username
        findUser(username).then((user) => {
            //console.log("++" + arg.password)
            //console.log("__" + user.password)
            if (!user) {
                socket.emit("loginFailed")
                return
            }
            bcrypt.compare(arg.password, user.password, (err, result) => {
                if (err) throw err
                
                if (result) {
                    //send initial DB result
                    Guild.find({}).then((guilds) => {
                        guilds = guilds.filter((guild) => user.guilds.map(userGuild => userGuild.guild_id).includes(guild.guild_id))
                        let guildsToSend = []
                        guilds.forEach((guild) => {
                            console.log(guild)
                            console.log("___")
                            console.log(user)
                            let categories = []
                            guild.categories.forEach((category) => {
                                let categoryObject = category
                                let channels = category.channels.filter((channel) => user.guilds.find((userGuild) => userGuild.guild_id == guild.guild_id).channels.includes(channel.channel_id))
                                categoryObject.channels = channels
                                categories.push(categoryObject)
                            })
                            let guildObject = guild
                            let freeChannels = guild.freeChannels.filter((channel) => user.guilds.find((userGuild) => userGuild.guild_id == guild.guild_id).channels.includes(channel.channel_id))
                            guildObject.categories = categories
                            guildObject.freeChannels = freeChannels
                            guildsToSend.push(guildObject)
                        })
                        console.log(guildsToSend)
                    socket.emit("loginSucceeded", guilds)
                        
                    })
                    //join guild rooms
                    for (guild of user.guilds) {
                        for (channel of guild.channels) {
                            socket.join(channel)
                        }
                        
                    }
                    
                    

                } else {
                    socket.emit("loginFailed")
                }
            })
        })
    })

    socket.on("userMessage", (arg) => {
        console.log(arg)
        client.guilds.fetch(arg.guild).then((guild) => {
            message = arg.message.message
            //Sanitize input against whitespace (A bot trying to send a message with only whitespace will crash)
            messageNoWhitespace = message.replace(" ", "").replace("\n", "")
            if (messageNoWhitespace) {
                const MessageEmbed = new Discord.MessageEmbed()
                .setAuthor(username)
                .setDescription(message)
            guild.channels.cache.find((channel) => channel.id == arg.channel).send(MessageEmbed)
            }
        })
        
    })
})




const client = new Discord.Client();
mongoose.connect(process.env.URI, {useNewUrlParser: true})


async function findGuilds() {

    return Guild.find({}, (err, guild) => {
        //console.log("found")
        if (err) throw err
        return guild
        
    })
}


function updateGuilds() {
    //Fires every time the bot starts, or joins or leaves a guild
    const guilds = client.guilds
    let guildObjects = []
    findGuilds().then((dbGuilds) => {
        //console.log(dbGuilds)

    guilds.cache.forEach((guild) => {
        let freeChannelObjects = []
        const freeChannels = guild.channels.cache.filter(c => c.type === "text" && !(c.parent))
        freeChannels.forEach(channel => {
            let channelMessages = [{author: "SYSTEM", content: "Welcome to DiscordNoodle! This marks the beginning of where Noodle has recorded messages", authorname: "SYSTEM", time: Date.now(), authoricon: '../../favicon.ico', message_id: "001"}]
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
                let channelMessages = [{author: "SYSTEM", content: "Welcome to DiscordNoodle! This marks the beginning of where Noodle has recorded messages", authorname: "SYSTEM", time: Date.now(), authoricon: '../../favicon.ico', message_id: "001"}]
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
                if (channel.type == "text") {
                channelObjects.push({
                    channel_id: channel.id,
                    name: channel.name,
                    messages: channelMessages,
                    topic: channel.topic
                }) 
                }
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
            freeChannels: freeChannelObjects,
            icon: guild.iconURL()
        })       
        //console.log(guild.iconURL())
        //console.log(guild.icon)
        
    })
    guildObjects.forEach(guild => {
        //Take new, updated guilds and either overwrite existing documents for that guild's ID or create a new one
        Guild.findOne({guild_id: guild.guild_id}, ((err, dbGuild) => {
            if (err) throw err
            if (dbGuild) {
            dbGuild.overwrite({guild})
            } else {
            const guildToSave = new Guild(guild)
            guildToSave.save()
            }
        }))
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

client.on("guildMemberAdd", (member) => {
    User.findOne({user_id: member.id}).then((dbMember) => {
        //If the user that just joined exists on the database, update the user's allowed guilds and channels to include the new guild access
        if (dbMember) {
            console.log(client.guilds.cache)
            const userGuildIds = [...client.guilds.cache.filter(guild => {guild.members.fetch(); console.log(guild.members.cache); return guild.members.cache.get(member.id)}).values()].map((guild) => guild.id)
            console.log(userGuildIds + "__")
                let userGuilds = []
                
                userGuildIds.forEach((id) => {
                    userGuilds.push({
                        guild_id: id,
                        channels: client.guilds.cache.find((guild) => (guild.id == id)).channels.cache.filter((channel) => channel.type == "text").filter(channel => {console.log(channel.permissionsFor(member)); return new Discord.Permissions(channel.permissionsFor(member)).has("VIEW_CHANNEL")}).map((channel) => channel.id)
                    })
                })
            dbMember.guilds = userGuilds
            dbMember.save()
        }
    })
})

client.on("guildMemberRemove", (member) => {
    //If the user that just left exists on the database, update the user's allowed guilds to exclude the guild they just left. 
    User.findOne({user_id: member.id}).then((dbMember) => {
        if (dbMember) {
            const newGuilds = dbMember.guilds.filter((guild) => guild.guild_id != member.guild)
            dbMember.guilds = newGuilds
            dbMember.save()
        }
    })
})

client.on("message", (message) => {
    if (message.content.startsWith("!register")) {
        // If the message is a register command
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
            User.findOne({username: args[1]}).then((user) => {
                if (user) {
                    message.channel.send("This user already exists!")
                    return
                }
            if (password == passwordConfirm) {
                client.guilds.cache.forEach((guild) => {
                    guild.members.fetch()
                    //console.log(guild)
                })
                
                const userGuildIds = [...client.guilds.cache.filter(guild => guild.members.cache.has(message.author.id)).values()].map((guild) => guild.id)
                let userGuilds = []
                
                userGuildIds.forEach((id) => {
                    userGuilds.push({
                        guild_id: id,
                        channels: client.guilds.cache.find((guild) => (guild.id == id)).channels.cache.filter((channel) => channel.type == "text").filter(channel => {console.log(channel.permissionsFor(message)); return new Discord.Permissions(channel.permissionsFor(message)).has("VIEW_CHANNEL")}).map((channel) => channel.id)
                    })
                })
                //console.log("User guilds")
                //console.log(userGuilds)
                bcrypt.hash(password, 12, (err, hash) => {
                    if (err) throw err;
                    //console.log(hash)
                    bcrypt.compare(password, hash).then((result)=>{console.log(result)})
                    const userToSave = new User({username: username, password: hash, guilds: userGuilds, user_id: message.author.id})
                    userToSave.save((err) => {if(err) throw err; console.log("Saved")})
                })
            } else {
                message.channel.send("The password and password confirmation did not match!")
                return
            }
        })
        } else if (args.length < 4 ) {
            message.channel.send("You didn't provide enough arguments!")
        } else {
            message.channel.send("You provided too many arguments!")
        }
        
        

    } else if (message.content.startsWith("!help")) {
        
    const HelpEmbed = new Discord.MessageEmbed()
        .setTitle("Help")
        .setAuthor("DiscordNoodle")
        .setDescription("Welcome to DiscordNoodle! A Discord bot that allows you to access your Discord server from anywhere! \n \n To get started, please register an account by DMing the bot with a command of the format \"!register [username] [password] [password again]\". \n\n Please make sure this is a DM, and do NOT type this command in a server or group chat, as obviously this is sharing a password in a public setting.  \n\n Afterwards, head on over to our website and put in your credentials you registered with the bot, and you're ready to go!")
        .setColor(0x99AAB5)
    message.channel.send(HelpEmbed)
    } else {
        if (message.guild) {
    let mssg = new Message({author: message.author.id, content: message.content, authorname: message.member.nickname? `${message.member.nickname}(${message.author.username})` : message.author.username, authoricon: message.author.displayAvatarURL(), time: Date.now(), message_id: message.id, attachments: message.attachments.map((attachment) => {return {name: path.basename(attachment.url), uri: attachment.url, mssgType: findFiletype(attachment)}})})
    //console.log(mssg)
    let emitMssg = {author: message.author.id, content: message.content, guild_id: message.guild.id, channel_id: message.channel.id, authorname: message.member.nickname? `${message.member.nickname}(${message.author.username})` : message.author.username, authoricon: message.author.displayAvatarURL(), time: Date.now(), message_id: message.id, attachments: message.attachments.map((attachment) => {return {name: path.basename(attachment.url), uri: attachment.url, mssgType: findFiletype(attachment)}})}
    //console.log(message.channel)
    if (message.channel.parent) {
        emitMssg = {...emitMssg, ...{category_id: message.channel.parentID}}
    }
    io.in(message.channel.id).emit("message", emitMssg)
    Guild.findOne({guild_id: message.guild.id}, (err, guild) => {
        if (message.channel.parent) {
            //console.log(guild.categories)
            //console.log(message.channel.parentID)
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
app.get("/", (req, res) => {res.sendFile(path.join(__dirname))})
app.get("*", (req, res) => {res.redirect("/")})




server.listen(process.env.PORT || 3000, 
	() => console.log("Server is running..."));