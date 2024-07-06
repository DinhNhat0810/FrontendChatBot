const getTokenMiddleware = require('../middleware/getTokenBot')
const { BotChat } = require('../models/bots')

const router = require('express').Router()

router.post('/add', async (req, res) => {
  try {
    const bot = await BotChat.findOne({ name: req.body.name })
    if (bot) {
      return res.status(200).json({
        message: 'Bot name already exists',
        status: 400
      })
    }
    const botToken = await BotChat.findOne({ token: req.body.token })
    if (botToken) {
      return res.status(200).json({
        message: 'Bot token already exists',
        status: 'error'
      })
    }
    if (!req.body.name) {
      return res.status(200).json({ message: 'Bot name is required', status: 400 })
    }

    if (!req.body.token) {
      return res.status(200).json({ message: 'Bot token is required', status: 400 })
    }

    const newBot = new BotChat({ ...req.body })
    const saveBot = await newBot.save()

    res.status(201).json({
      message: 'Created successfully!',
      status: 200,
      payload: saveBot
    })
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.put('/update/:id', async (req, res) => {
  try {
    const checkExisNAme = await BotChat.findOne({ name: req.body.name })
    const checkExisToken = await BotChat.findOne({ token: req.body.token })

    if (checkExisNAme) {
      return res.status(200).json({
        message: 'Bot name already exists',
        status: 'error'
      })
    }

    if (checkExisToken) {
      return res.status(200).json({
        message: 'Bot token already exists',
        status: 'error'
      })
    }

    if (!req.body.name) {
      return res.status(200).json({ message: 'Bot name is required', status: 'error' })
    }

    if (!req.body.token) {
      return res.status(200).json({ message: 'Bot token is required', status: 'error' })
    }

    const updateBot = await BotChat.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true })

    res.status(201).json({
      message: 'Created successfully!',
      status: 'success',
      payload: updateBot
    })
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.get('/', async (req, res) => {
  try {
    const bot = await BotChat.find().sort({ createdAt: -1 })
    res.status(201).json({
      status: 200,
      payload: bot
    })
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.get('/get-by-id/:id', async (req, res) => {
  try {
    const bot = await BotChat.findById(req.params.id)

    if (!bot) {
      return res.status(200).json({
        message: 'Bot not found',
        status: 400
      })
    }

    res.status(201).json({
      status: 200,
      payload: bot
    })
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.delete('/delete/:id', async (req, res) => {
  try {
    const bot = await BotChat.findById(req.params.id)
    if (!bot) {
      return res.status(200).json({
        message: 'Bot not found',
        status: 400
      })
    }

    const deletebot = await BotChat.findByIdAndDelete(req.params.id)
    res.status(201).json({
      status: 200,
      payload: deletebot,
      message: 'Deleted successfully!'
    })
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.put('/add-group', async (req, res) => {
  try {
    if (!req.body.botId) {
      return res.status(200).json({ message: 'Bot Id is required', status: 400 })
    }

    if (!req.body.groupId) {
      return res.status(200).json({ message: 'Group Id is required', status: 400 })
    }

    if (!req.body.name) {
      return res.status(200).json({ message: 'Group name is required', status: 400 })
    }

    const bot = await BotChat.findById(req.body.botId)

    if (!bot) {
      return res.status(200).json({ message: 'Bot not found', status: 400 })
    }

    const checkExist = bot.listGroup.filter(group => group.groupId == req.body.groupId || group.name == req.body.name)

    if (checkExist && checkExist.length > 0) {
      return res.status(200).json({
        message: 'Group name or group Id already exists',
        status: 400
      })
    }

    const updateBot = await BotChat.findOneAndUpdate(
      { _id: req.body.botId },
      {
        $push: {
          listGroup: req.body
        }
      },
      { new: true }
    )
    res.status(201).json({
      status: 200,
      payload: updateBot,
      message: 'Added group successfully!'
    })
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.put('/remove-group', async (req, res) => {
  try {
    if (!req.body.botId) {
      return res.status(200).json({ message: 'Bot Id is required', status: 400 })
    }

    const bot = await BotChat.findById(req.body.botId)

    if (!bot) {
      return res.status(200).json({ message: 'Bot not found', status: 400 })
    }

    const checkExist = bot.listGroup.filter(group => group.groupId === req.body.groupId)

    if (checkExist.length == 0) {
      return res.status(200).json({ message: 'Group not found', status: 400 })
    }

    const update = await BotChat.findOneAndUpdate(
      { _id: req.body.botId },
      {
        listGroup: bot.listGroup.filter(group => group.groupId !== req.body.groupId)
      },
      { new: true }
    )
    res.status(201).json({
      status: 200,
      payload: update,
      message: 'Removed group successfully!'
    })
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.put('/update-group', async (req, res) => {
  try {
    if (!req.body.botId) {
      return res.status(200).json({ message: 'Bot Id is required', status: 400 })
    }

    const bot = await BotChat.findById(req.body.botId)

    if (!bot) {
      return res.status(200).json({ message: 'Bot not found', status: 400 })
    }

    const checkExist = bot.listGroup.filter(group => group.groupId === req.body.groupId)

    if (checkExist.length == 0) {
      return res.status(200).json({ message: 'Group not found', status: 400 })
    }

    const checkExistGroup = bot.listGroup.some(
      group =>
        (group.groupId === req.body.groupId || group.name === req.body.name) && group.groupId !== req.body.groupId
    )

    if (checkExistGroup) {
      return res.status(400).json({ message: 'Group already exists', status: 400 })
    }

    const fieldsToUpdate = {
      ...req.body
    }

    delete fieldsToUpdate.botId
    delete fieldsToUpdate.groupId

    const setFields = {}
    Object.keys(fieldsToUpdate).forEach(key => {
      setFields[`listGroup.$[elem].${key}`] = fieldsToUpdate[key]
    })

    const update = await BotChat.findByIdAndUpdate(
      req.body.botId,
      {
        $set: setFields
      },
      {
        arrayFilters: [{ 'elem.groupId': req.body.groupId }],
        new: true
      }
    )
    res.status(201).json({
      status: 200,
      payload: update,
      message: 'Updated group successfully!'
    })
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

module.exports = router
