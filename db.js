const mongoose = require("mongoose")
const mongoUri = "mongodb://localhost:27017/iNoteBook"

function connectMongo() {
    mongoose.connect(mongoUri, function () {
        console.log("Connected to Mongo Successfully")
    })
}

module.exports = connectMongo

