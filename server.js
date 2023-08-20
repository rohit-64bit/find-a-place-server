const express = require('express');
const connectToMongo = require('./Config/db');
const app = express()
const cors = require('cors')

require('dotenv').config()

const env = process.env;

connectToMongo()

const PORT = 8888 || process.env.PORT

app.use(express.json())

app.use(cors())

app.get('/', (req, res) => {
    res.send("Hello World")
})


app.use('/api/user', require('./Routes/manageUser'))

app.use('/api/forget-password', require('./Routes/manageForgotPassword'))

app.use('/api/property', require('./Routes/manageProperty'))

app.listen(PORT, () => {
    console.log(`Server Running at ${PORT}`)
})