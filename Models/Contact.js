const mongoose = require('mongoose')
const { Schema } = mongoose

const ContactSchema = new Schema({

    name: {
        type: String
    },
    email: {
        type: String
    },
    subject: {
        type: String
    },
    message: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String
    },
    status: {
        type: String,
        default: 'new'
    },
    isExistingUser: {
        type: Boolean
    }

})

module.exports = mongoose.model('contact', ContactSchema)