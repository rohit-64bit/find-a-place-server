const mongoose = require('mongoose')
const { Schema } = mongoose

const PropertyTypeSchema = new Schema({

    typeName: {
        type: String,
        required: true
    },
    typeDescription: {
        type: String,
        required: true
    }

})

module.exports = mongoose.model('propertyType', PropertyTypeSchema)