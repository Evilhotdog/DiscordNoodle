const express = require("express");
const path = require("path")
const Discord = require("discord.js")
const config = require("dotenv").config()
const app = express()
const client = new Discord.Client();

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
});

client.on("message", (message) => {
    console.log(message.content)
})


client.login(process.env.BOT_TOKEN)
app.get('/', (req, res) =>  res.sendFile(path.resolve('src/index.html')));
app.listen(process.env.PORT || 3000, 
	() => console.log("Server is running..."));