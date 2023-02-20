const express = require("express")
const connectMongo = require("./db")
const cors = require('cors')

connectMongo()

const app = express()

app.use(express.json({
    type: ['application/json', 'text/plain']
}))
app.use(cors());
const corsOptions = {
    origin: "http://localhost:3000"
};

app.use('/api/auth', cors(corsOptions), require("./routes/auth"))
app.use('/api/notes', cors(corsOptions), require("./routes/notes"))

app.listen(5000, () => {
    console.log("Server is Running at port 5000")
})