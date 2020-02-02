const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fb_id: Number,
    name: String,
    dateJoined: String,
    footsteps: [{
        date: String,
        foodLog: [
            {
                foodName: String,
                servings: Number,
                emissions: Number
            }
        ],
        transportationLog: [
            {
                mode: String,
                distance: Number,
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
        distanceWalked: Number,
        distanceByCar: Number,
        avgFoodEmissions: Number
    }
});

module.exports = mongoose.model('User', userSchema);