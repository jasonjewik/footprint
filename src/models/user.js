const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fb_id: Number,
  name: String,
  dateJoined: String,
  footsteps: [
    {
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
    }
  ],
  lifetimeStats: {
    emissions: {
      type: Number,
      default: 0
    },
    distanceWalked: {
      type: Number,
      default: 0
    },
    distanceByCar: {
      type: Number,
      default: 0
    },
    avgFoodEmissions: {
      type: Number,
      default: 0
    }
  }
});

module.exports = mongoose.model('User', userSchema);