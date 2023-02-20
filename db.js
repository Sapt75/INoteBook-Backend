const mongoose = require("mongoose")
// const mongoUri = "mongodb://localhost:27017/iNoteBook"
const mongoUri = "mongodb+srv://inotebook:abcd@1234@cluster0.daudrwc.mongodb.net/iNoteBook?retryWrites=true&w=majority"


function connectMongo() {
    mongoose.connect(mongoUri, function () {
        console.log("Connected to Mongo Successfully")
    })
}

module.exports = connectMongo

