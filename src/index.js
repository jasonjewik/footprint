require('dotenv').config();

const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const mongo = require('./db/mongo');
const UserModel = require('./models/user');
const {UserController} = require('./controllers/user');
const {GoogleVisionAPI} = require('./services/googleapis');

function main(port)
{
	const app = express();
	app.disable('x-powered-by');
	app.use(compression());
	app.use(morgan('dev'));
	app.use(cors());
	app.use(cookieParser());
	app.use(bodyParser.json());

	const router = express.Router();
	const userController = UserController(UserModel);
	const googleVisionAPI = GoogleVisionAPI();
	router.use('/users', userController);
	router.use('/vision', googleVisionAPI);

	app.use('/api', router);
	app.listen(port, () => {
		console.log(`Listening on port ${port}!`);
	});
}

main(process.env.PORT || 3000);