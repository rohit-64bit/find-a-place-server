const mongoose = require('mongoose');

require('dotenv').config()
const env = process.env
mongoose.set('strictQuery', true);

const mongoURI = env.mongoURI;

const connectToMongo = async () => {
    try {

        await mongoose.connect(mongoURI);
        console.log('Connected to DB');

    } catch (error) {

        console.log(error.message);

    }
}

module.exports = connectToMongo;