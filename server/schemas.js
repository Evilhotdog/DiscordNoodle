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
    id: String
})
const Channel = mongoose.model("Channel", channelSchema)
const guildSchema = new Schema({
    name: String,
    categories: [{name: String, channels: [channelSchema]}],
    channels: [channelSchema],
    guild_id: String
  }
);
const Guild = mongoose.model("Guild", guildSchema)

module.exports = {Attachment, Message, Channel, Guild}