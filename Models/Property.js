const mongoose = require('mongoose')
const { Schema } = mongoose

const PropertySchema = new Schema({

    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    location: {
        type: String,
        require: true
    },
    cost: {
        type: String,
        require: true
    },
    images: [
        {
            type: String
        }
    ],
    lastBookingTime: {
        type: String
    },
    isAvailable: {
        type: Boolean
    },
    RatingScore: {
        type: Number
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'propertyType',
        require: true
    },
    contact: {
        type: String,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true
    }

})


module.exports = mongoose.model('property', PropertySchema)