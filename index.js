const express = require("express");
const path = require("path")
const Discord = require("discord.js")
const config = require("dotenv").config()
const app = express()
const client = new Discord.Client();

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
});



client.login(process.env.BOT_TOKEN)

