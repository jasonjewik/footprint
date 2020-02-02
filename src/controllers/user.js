const express = require('express');
const mongoose = require('mongoose');

const UserController = (UserModel) =>
{
    const router = express.Router();

    router.post('/signup', async(req, res) => {
        // Validate request body
        const fb_id = req.body.fb_id;
        const name = req.body.name; 
        if (fb_id === undefined || name === undefined)
            return res.status(400).json({
                error: 'Malformed request'
            });

        // Check if the user already exists
        const priorData = await UserModel.findOne({fb_id: fb_id});
        if (priorData != null) 
            return res.status(200).json(priorData);

        // Insert new user if does not exist
        const user = new UserModel({
            fb_id: fb_id,
            name: name,
            dateJoined: new Date().toDateString(),
            lifetimeStats: {
                emissions: 0,
                waterUsed: 0,
                distanceWalked: 0,
                distanceByCar: 0,
                avgFoodEmissions: 0,
                avgFoodWaterUse: 0
            }
        });
        
        const newData = await user.save();
        return res.status(201).json(newData);
    });

    router.get('/me', async(req, res) => {
        // Validate request body
        const fb_id = req.body.fb_id;
        if (fb_id === undefined)
            return res.status(400).json({
                error: 'Malformed request'
            });
        
        // Get user
        const data = await UserModel.findOne({fb_id: fb_id});
        if (data != null)
            return res.status(200).json(data);

        return res.status(404).json({
            error: 'Invalid User ID'
        });
    });

    router.post('/footstep', async(req, res) => {

        // Validate request body
        const fb_id = req.body.fb_id;
        if (fb_id === undefined)
            return res.status(400).json({
                error: 'Malformed request'
            });

        // Check if user exists
        const priorData = await UserModel.findOne({fb_id: fb_id});
        if (priorData == null) 
            return res.status(404).json({
                error: 'Invalid User ID'
            });

        // Check if footstep for date already exists
        const date = new Date().toDateString();
        const priorFootstep = await UserModel.findOne({"fb_id": fb_id, "footsteps.date": date});
        if(priorFootstep != null)
            return res.status(404).json({
                error: 'Footstep for date already exists'
            });

        // Create and insert new footstep
        const new_footstep = { date: date, 
                               foodLog: [], 
                               transportationLog: [], 
                               stats: {
                                   emissions: 0,
                                   waterUsed: 0,
                                   distanceWalked: 0,
                                   distanceByCar: 0
                               } };

        let data = await UserModel.findOneAndUpdate(
            { fb_id: fb_id },
            { $push: { footsteps: new_footstep } },
            { returnOriginal: false, useFindAndModify: false }
        );

        return res.status(200).json(data);

    });

    router.post('/food', async(req, res) => {

        // Validate request body
        const fb_id = req.body.fb_id;
        const date = req.body.date;
        const foodName = req.body.foodName;
        const servings = req.body.servings;
        const emissions = req.body.emissions;
        const waterUsed = req.body.waterUsed;

        if (fb_id === undefined || date === undefined || foodName === undefined || 
            servings === undefined || emissions === undefined || waterUsed === undefined)
            return res.status(400).json({
                error: 'Malformed request'
            });

        // Check if user exists
        const priorData = await UserModel.findOne({fb_id: fb_id});
        if (priorData == null) 
            return res.status(404).json({
                error: 'Invalid User ID'
            });
        
        // Scan through footsteps and add new food log
        for(footstep of priorData.footsteps) {
            if(footstep.date === date) {
                let newLog = {
                    foodName: foodName,
                    servings: servings,
                    emissions: emissions,
                    waterUsed: waterUsed
                };

                footstep.foodLog.push(newLog);
                priorData.save();

                return res.status(200).json(priorData);
            }
        }

        return res.status(404).json({
            error: 'No footstep for date found'
        });
        
    });

    router.post('/transportation', async(req, res) => {

        // Validate request body
        const fb_id = req.body.fb_id;
        const date = req.body.date;
        const mode = req.body.mode;
        const distance = req.body.distance;
        const duration = req.body.duration;
        const emissions = req.body.emissions;

        if (fb_id === undefined || date === undefined || mode === undefined || 
            distance === undefined || duration === undefined || emissions === undefined)
            return res.status(400).json({
                error: 'Malformed request'
            });

        // Check if user exists
        const priorData = await UserModel.findOne({fb_id: fb_id});
        if (priorData == null) 
            return res.status(404).json({
                error: 'Invalid User ID'
            });
        
        // Scan through footsteps and add new transportation log
        for(footstep of priorData.footsteps) {
            if(footstep.date === date) {
                let newLog = {
                    mode: mode,
                    distance: distance,
                    duration: duration,
                    emissions: emissions
                };

                footstep.transportationLog.push(newLog);
                priorData.save();

                return res.status(200).json(priorData);
            }
        }

        return res.status(404).json({
            error: 'No footstep for date'
        });
        
    });

    return router;
}

module.exports = {
    UserController
}