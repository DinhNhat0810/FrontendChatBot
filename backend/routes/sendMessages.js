const getTokenMiddleware = require('../middleware/getTokenBot')
const cron = require('node-cron')
const router = require('express').Router()
const TelegramBot = require('node-telegram-bot-api')
const { BotChat } = require('../models/bots')

router.post('/', getTokenMiddleware, async (req, res) => {
  try {
    if (!req.body.message) {
      return res.status(400).json({ message: 'Message is required' })
    }

    // https://apps.timwhitlock.info/emoji/tables/unicode
    const result = await req.bot.sendMessage(req.groupId, req.body.message, {
      parse_mode: 'html'
    })

    res.status(200).json({ message: 'Message sent successfully', status: 200 })
  } catch (err) {
    res.status(500).json({ message: 'Error sending message', status: 500 })
  }
})

let tasks = {}

router.post('/start-cron', getTokenMiddleware, async (req, res) => {
  try {
    const bot = await BotChat.findById(req.body.botId)

    if (bot) {
      const group = bot.listGroup.find(item => {
        return item.groupId == req.body.groupId
      })

      if (group) {
        tasks[group.groupId] = cron.schedule(group.cronTime, async () => {
          await req.bot.sendMessage(group.groupId, group.cronMessage, {
            parse_mode: 'html'
          })
        })
      } else {
        return res.status(400).json({ message: 'Group not found', status: 400 })
      }
    } else {
      return res.status(400).json({ message: 'Bot not found', status: 400 })
    }

    res.status(200).json({ message: 'Cron job started', status: 200 })
  } catch (err) {
    res.status(500).json({ message: 'Error starting cron job', status: 500 })
  }
})

router.post('/stop-cron', getTokenMiddleware, async (req, res) => {
  try {
    const bot = await BotChat.findById(req.body.botId)

    if (bot) {
      const group = bot.listGroup.find(item => {
        return item.groupId == req.body.groupId
      })

      if (group) {
        tasks[req.body.groupId].stop()
      } else {
        return res.status(400).json({ message: 'Group not found', status: 400 })
      }
    } else {
      return res.status(400).json({ message: 'Bot not found', status: 400 })
    }

    res.status(200).json({ message: 'Cron job stopped', status: 200 })
  } catch (err) {
    res.status(500).json({ message: 'Error stopping cron job', status: 500 })
  }
})

router.put('/update-cron', getTokenMiddleware, async (req, res) => {
  try {
    if (!req.body.cronMessage) {
      return res.status(400).json({ message: 'Message is required', status: 400 })
    }

    const updateGroup = await BotChat.findByIdAndUpdate(
      req.body.botId,
      {
        $set: {
          'listGroup.$[elem].cronTime': req.body.cronTime,
          'listGroup.$[elem].cronMessage': req.body.cronMessage
        }
      },
      {
        arrayFilters: [{ 'elem.groupId': req.body.groupId }],
        new: true
      }
    )

    res.status(200).json({
      message: 'Cron job updated',
      status: 200,
      payload: updateGroup
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Error updating cron job', status: 500 })
  }
})

module.exports = router
