require("dotenv").config();
const mongoose = require('mongoose');

// Connect to the Mongo DB
const dbURI = process.env.MONGO_URI;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true }).then(
    () => {
        console.log("Connected successfully!");
    },
    err => {
        console.log("Connection failed: ", err);
    }
);

module.exports = mongoose.connection;