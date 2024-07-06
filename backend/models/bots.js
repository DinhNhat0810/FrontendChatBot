const mongoose = require('mongoose')

const BotChatsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    token: { type: String, required: true, unique: true },
    listGroup: [
      {
        groupId: { type: String, required: true, unique: true },
        name: { type: String, required: true, unique: true },
        activeCron: { type: Boolean, default: false },
        cronTime: { type: String, default: '0 0 * * * *' }, //
        cronMessage: { type: String, default: 'Hello' }
      }
    ]
  },
  { timestamps: true }
)

const BotChat = mongoose.model('BotChat', BotChatsSchema)

module.exports = {
  BotChat
}
