const mongoose = require('mongoose')
const { Schema } = mongoose

const UserSchema = new Schema({

    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    contact: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isAuth: {
        type: Boolean,
        default: false
    },
    joinedOn:{
        type: Date,
        default: Date.now
    }
    
})

module.exports = mongoose.model('user', UserSchema)