const express = require("express");
const path = require("path")
const Discord = require("discord.js")
const config = require("dotenv").config()
const http = require("http");
const {MongoClient} = require('mongodb');


const app = express()
const client = new Discord.Client();
const mongo = new MongoClient(process.env.URI)

async function run() {
try {
    await mongo.connect();

    await listDatabases(mongo);
 
} catch (e) {
    console.error(e);
} finally {
    await mongo.close();
}
}
run().catch(console.dir)
async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};
 


client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
});

client.on("message", (message) => {
    console.log(message.content)
})


client.login(process.env.BOT_TOKEN) 


 
app.use(express.static(__dirname + "/dist/DiscordNoodle"))
app.get("/*", (req, res) => res.sendFile(path.join(__dirname)))
const server = http.createServer(app)
app.listen(process.env.PORT || 3000, 
	() => console.log("Server is running..."));