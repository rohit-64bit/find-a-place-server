const mongoose = require('mongoose')
const { Schema } = mongoose

const ErrorSchema = new Schema({

    path: {
        type: String
    },
    errorMessage: {
        type: String
    },
    errorDetails: {
        type: mongoose.Schema.Types.Mixed
    },
    status: {
        type: String,
        default: 'new'
    },
    solved: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model('error', ErrorSchema)