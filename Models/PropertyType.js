const mongoose = require('mongoose')
const { Schema } = mongoose

const PropertyTypeSchema = new Schema({

    type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }

})

module.exports = mongoose.model('propertyType', PropertyTypeSchema)