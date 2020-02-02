const express = require('express');
const vision = require("@google-cloud/vision");
const fs = require('fs');

const GoogleVisionAPI = () => {
	const router = express.Router();

	router.post('/', async(req, res) => {
		const client = new vision.ImageAnnotatorClient();
		const img = req.body.img;

		if (img === undefined)
			return res.status(400).json({
				error: 'Malformed request'
			});

		// const imgFile = fs.readFileSync(img);
		// const encoded = Buffer.from(imgFile).toString('base64');
		// console.log(encoded);
		const [result] = await client.labelDetection({image: {content: img}});
		const labels = result.labelAnnotations;

		let outputs = [];
		labels.forEach(label =>
			outputs.push([label.description, label.score])
		);
		
		return res.status(200).json(outputs);
	});

	return router;
};

module.exports = {
	GoogleVisionAPI
};