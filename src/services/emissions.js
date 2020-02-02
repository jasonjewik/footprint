const EmissionChart = require('./emission-chart.json')

const FOOD_TIERS = {
  1: 125,
  2: 300,
  3: 800,
  4: 1500,
  5: 3750
}

const AVERAGE_FOOD_EMISSIONS = 750

function foodEmissions(food, servings) {
  const words = food.toLowerCase().split(' ')
  let totalTier = 0
  let count = 0
  for (const word of words) {
    if (EmissionChart[word]) {
      totalTier += EmissionChart[word]
      count += 1
    }
  }
  const averageTier = count === 0 ? 0 : Math.round(totalTier / count)
  if (averageTier > 0) {
    return (AVERAGE_FOOD_EMISSIONS - FOOD_TIERS[averageTier]) * servings
  }
  return 0
}

const AVERAGE_TRANSPORT_EMISSIONS = 200

function transportEmissions(mode, distance) {
  if (mode === 'car') {
    return (AVERAGE_TRANSPORT_EMISSIONS - 411) * distance
  }
  return AVERAGE_TRANSPORT_EMISSIONS * distance
}

module.exports = {
  FOOD_TIERS,
  EmissionChart,
  foodEmissions,
  transportEmissions
}
