const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fb_id: Number,
    name: String,
    dateJoined: Date,
    footsteps: [{
        date: Date,
        foodLog: [
            {
                name: String,
                emissions: Number,
                waterUsed: Number
            }
        ],
        transportationLog: [
            {
                mode: String,
                distance: Number,
                duration: Number,
                emissions: Number
            }
        ],
        stats: {
            emissions: Number,
            waterUsed: Number,
            distanceWalked: Number,
            distanceByCar: Number
        }
    }],
    lifetimeStats: {
        emissions: Number,
        waterUsed: Number,
        distanceWalked: Number,
        distanceByCar: Number,
        avgFoodEmissions: Number,
        avgFoodWaterUse: Number
    }
});

module.exports = mongoose.model('User', userSchema);