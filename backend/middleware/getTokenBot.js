const TelegramBot = require('node-telegram-bot-api')

const getTokenMiddleware = async (req, res, next) => {
  try {
    const token = req.body.token

    if (!token) {
      return res.status(400).json({ message: 'Token is required' })
    }

    if (!req.body.groupId) {
      return res.status(400).json({ message: 'idGroup is required' })
    }

    const bot = new TelegramBot(token, { polling: false })
    req.bot = bot
    req.groupId = req.body.groupId

    next()
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

module.exports = getTokenMiddleware
