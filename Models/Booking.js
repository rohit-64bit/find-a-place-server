const mongoose = require('mongoose')
const { Schema } = mongoose

const BookingSchema = new Schema({

    propertyID: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'property'
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'user'
    },
    startDate: {
        type: Date,
        require: true
    },
    endDate: {
        type: Date,
        require: true
    },
    status: {
        type: String,
        default: 'new'
    },
    isCanceled: {
        type: Boolean,
        default: false
    }

})

module.exports = mongoose.model('booking', BookingSchema)