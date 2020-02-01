const mongo = require('./db/mongo');
const User = require('./models/user');

function main()
{
	let jason = new User({
		fb_id: 1,
		name: "Jason Jewik", 
		dateJoined: new Date(),
		footsteps: [{
			date: new Date(),
			foodLog: [
				{
					name: "Chicken",
					emissions: 5,
					waterUsed: 10
				},
				{
					name: "Beef",
					emissions: 10,
					waterUsed: 20
				}
			],
			transportationLog: [
				{
					mode: "Walk",
					distance: 10,
					duration: 30,
					emissions: 0
				},
				{
					mode: "Car",
					distance: 100,
					duration: 10,
					emissions: 50
				}
			],
			stats: {
				emissions: 65,
				waterUsed: 30,
				distanceWalked: 10,
				distanceByCar: 100
			}
		}],
		lifetimeStats: {
			emissions: 65,
			waterUsed: 30, 
			distanceWalked: 10,
			distanceByCar: 100, 
			avgFoodEmissions: 15,
			avgFoodWaterUse: 30
		}
	});
	
	jason.save((err) => {
		if (err) {
			console.log("Error saving document: " + err);
			mongo.close();
		}
		else {
			console.log("Document saved!");
			mongo.close();
		}
	});
}

main();