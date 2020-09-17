const mongoose = require('mongoose')

const Schema = mongoose.Schema

const testSchema = new Schema({
    _id: {
        type:Number,
    },
    lat: {
        type:Number,
        required:true
    },
    long: {
        type:Number,
        required:true
    }
})

const testModel = mongoose.model('test',testSchema)

module.exports = testModel