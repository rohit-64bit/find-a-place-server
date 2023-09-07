const mongoose = require('mongoose')
const { Schema } = mongoose

const ReviewSchema = new Schema({

    date: {
        type: Date,
        default: Date.now
    },
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        require: true
    },
    propertyID: {
        type: Schema.Types.ObjectId,
        ref: 'property',
        require: true
    },
    bookingID: {
        type: Schema.Types.ObjectId,
        ref: 'booking',
        require: true
    },
    rating: {
        type: Number,
        require: true
    },
    comment: {
        type: String,
        require: true
    },
    description: {
        type: String
    },
    reply: {
        type: true,
        default: false
    },
    replyText:{
        type: String
    }

})

module.exports = mongoose.model('admin', ReviewSchema)