require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const utils = require('../services/utils')
const vision = require('@google-cloud/vision')
const {
  FOOD_TIERS,
  transportEmissions,
  foodEmissions,
  EmissionChart
} = require('../services/emissions')

const client = new vision.ImageAnnotatorClient({
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY
  },
  projectId: process.env.PROJECT_ID
})

const UserController = UserModel => {
  const router = express.Router()

  router.post('/signup', async (req, res) => {
    // Validate request body
    const fb_id = req.body.fb_id
    const name = req.body.name
    if (fb_id === undefined || name === undefined)
      return res.status(400).json({
        error: 'Malformed request'
      })

    // Check if the user already exists
    const priorData = await UserModel.findOne({ fb_id: fb_id })
    if (priorData != null) return res.status(200).json(priorData)

    // Insert new user if does not exist
    const user = new UserModel({
      fb_id: fb_id,
      name: name,
      dateJoined: new Date().toDateString(),
      lifetimeStats: {
        emissions: 0,
        distanceWalked: 0,
        distanceByCar: 0,
        avgFoodEmissions: 0
      }
    })

    const newData = await user.save()
    return res.status(201).json(newData)
  })

  router.get('/me', async (req, res) => {
    // Validate request body
    const fb_id = req.body.fb_id
    if (fb_id === undefined)
      return res.status(400).json({
        error: 'Malformed request'
      })

    // Get user
    const data = await UserModel.findOne({ fb_id: fb_id })
    if (data != null) return res.status(200).json(data)

    return res.status(404).json({
      error: 'Invalid User ID'
    })
  })

  router.post('/footstep', async (req, res) => {
    // Validate request body
    const fb_id = req.body.fb_id
    if (fb_id === undefined)
      return res.status(400).json({
        error: 'Malformed request'
      })

    // Check if user exists
    const priorData = await UserModel.findOne({ fb_id: fb_id })
    if (priorData == null)
      return res.status(404).json({
        error: 'Invalid User ID'
      })

    // Check if footstep for date already exists
    let date = new Date()
    date.setHours(date.getHours() - 8)
    date = date.toDateString()
    const priorFootstep = await UserModel.findOne({
      fb_id: fb_id,
      'footsteps.date': date
    })
    if (priorFootstep != null)
      return res.status(200).json({
        error: 'Footstep for date already exists'
      })

    // Create and insert new footstep
    const new_footstep = {
      date: date,
      foodLog: [],
      transportationLog: [],
      stats: {
        emissions: 0,
        distanceWalked: 0,
        distanceByCar: 0
      }
    }

    let data = await UserModel.findOneAndUpdate(
      { fb_id: fb_id },
      { $push: { footsteps: new_footstep } },
      { returnOriginal: false, useFindAndModify: false }
    )

    return res.status(200).json(data)
  })

  router.post('/food', async (req, res) => {
    // Validate request body
    const fb_id = req.body.fb_id
    const date = req.body.date
    const foodName = req.body.foodName
    const servings = req.body.servings

    if (
      fb_id === undefined ||
      date === undefined ||
      foodName === undefined ||
      servings === undefined
    )
      return res.status(400).json({
        error: 'Malformed request'
      })

    // Check if user exists
    const priorData = await UserModel.findOne({ fb_id: fb_id })
    if (priorData == null)
      return res.status(404).json({
        error: 'Invalid User ID'
      })

    // Scan through footsteps and add new food log
    for (footstep of priorData.footsteps) {
      if (footstep.date === date) {
        const emissions = foodEmissions(foodName, servings)
        let newLog = {
          foodName,
          servings,
          emissions
        }

        footstep.foodLog.push(newLog)
        priorData.save()

        return res.status(200).json(priorData)
      }
    }

    return res.status(404).json({
      error: 'No footstep for date found'
    })
  })

  router.post('/transportation', async (req, res) => {
    // Validate request body
    const fb_id = req.body.fb_id
    const date = req.body.date
    const mode = req.body.mode
    const distance = req.body.distance

    if (
      fb_id === undefined ||
      date === undefined ||
      mode === undefined ||
      distance === undefined
    )
      return res.status(400).json({
        error: 'Malformed request'
      })

    // Check if user exists
    const priorData = await UserModel.findOne({ fb_id: fb_id })
    if (priorData == null)
      return res.status(404).json({
        error: 'Invalid User ID'
      })

    const emissions = transportEmissions(mode, distance)

    // Scan through footsteps and add new transportation log
    for (footstep of priorData.footsteps) {
      if (footstep.date === date) {
        let newLog = {
          mode: mode,
          distance: distance,
          emissions: emissions
        }
        footstep.transportationLog.push(newLog)

        // Update footstep stats for the day
        footstepStats = footstep.stats
        if (mode === 'Walking') footstepStats.distanceWalked += distance
        else if (mode === 'Car') footstepStats.distanceByCar += distance

        footstepStats.emissions += emissions

        priorData.save()
        return res.status(200).json(priorData)
      }
    }

    return res.status(404).json({
      error: 'No footstep for date'
    })
  })

  router.get('/lifetime', async (req, res) => {
    // Validate request body
    const fb_id = req.body.fb_id
    if (fb_id === undefined)
      return res.status(400).json({
        error: 'Malformed request'
      })

    // Check if user exists
    const priorData = await UserModel.findOne({ fb_id: fb_id })
    if (priorData == null)
      return res.status(404).json({
        error: 'Invalid User ID'
      })

    // Update lifetime stats
    for (footstep of priorData.footsteps) {
      priorData.lifetimeStats.emissions += footstep.stats.emissions
      priorData.lifetimeStats.distanceWalked += footstep.stats.distanceWalked
      priorData.lifetimeStats.distanceByCar += footstep.stats.distanceByCar
    }

    priorData.save()
    return res.status(200).json(priorData.lifetimeStats)
  })

  return router
}

router.post('/vision', async (req, res) => {
  const fb_id = req.body.fb_id
  const encoded = req.encoded
  const date = req.date
  if (fb_id === undefined || encoded === undefined || date === undefined)
    return res.status(400).json({
      error: 'Malformed request'
    })

  const priorData = await UserModel.findOne({ fb_id: fb_id })
  if (priorData == null)
    return res.status(404).json({
      error: 'Invalid User ID'
    })

  // const imgFile = fs.readFileSync(img);
  // const encoded = Buffer.from(imgFile).toString('base64');
  // console.log(encoded);
  const [result] = await client.labelDetection({ image: { content: encoded } })
  const labels = result.labelAnnotations

  let outputs = []
  labels.forEach(label => outputs.push([label.description, label.score]))
  let totalTier = 0
  let count = 0
  const detectedFoods = []

  outputs.forEach(([desc, score]) => {
    if (score > 0.5 && EmissionChart[desc.toLowerCase()]) {
      totalTier += EmissionChart[desc.toLowerCase()]
      detectedFoods.push(desc)
      count += 1
    }
  })
  if (count > 0) {
    const tier = totalTier / count
    const emissions = FOOD_TIERS[tier] * detectedFoods.length * 2

    for (footstep of priorData.footsteps) {
      if (footstep.date === date) {
        detectedFoods.forEach(foodName => {
          let newLog = {
            foodName,
            servings: 2,
            emissions: emissions / detectedFoods.length
          }
          footstep.foodLog.push(newLog)
        })

        priorData.save()

        return res.status(200).json(detectedFoods)
      }
    }
  }
})

module.exports = {
  UserController
}
