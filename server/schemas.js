const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const attachmentSchema = new Schema({
    name: String,
    uri: String,
    mssgType: String,
  })
const Attachment = mongoose.model("Attachment", attachmentSchema)
const MessageSchema = new Schema({
    author: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: false
    },
    attachments: [attachmentSchema],
    time: Date,
    id: String

  });
const Message = mongoose.model("Message", MessageSchema)
const channelSchema = new Schema({
    name: String,
    messages: [MessageSchema],
    channel_id: String
})
const Channel = mongoose.model("Channel", channelSchema)
const guildSchema = new Schema({
    name: String,
    categories: [{name: String, channels: [channelSchema], category_id: String}],
    freeChannels: [channelSchema],
    guild_id: String,
    icon: String
  }
);
const Guild = mongoose.model("Guild", guildSchema)

const userSchema = new Schema({
  username: String,
  password: String,
  guilds: [String],
  user_id: String
})

const User = mongoose.model("User", userSchema)

module.exports = {User, Attachment, Message, Channel, Guild}