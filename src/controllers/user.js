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
            dateJoined: new Date()
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

        // Create and insert new footstep
        const new_footstep = { date: new Date(), 
                               foodLog: [], 
                               transportationLog: [], 
                               stats: {
                                   emissions: 0,
                                   waterUsed: 0,
                                   distanceWalked: 0,
                                   distanceByCar: 0
                               } };

        let data = await UserModel.update(
            { fb_id: fb_id },
            { $push: { footsteps: new_footstep } },
            { new: true }
        );

        return res.status(200).json(data);

    });

    return router;
}

module.exports = {
    UserController
}