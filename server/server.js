const express = require('express')
const cloudinary = require('cloudinary').v2
const dotenv = require('dotenv')
const connectDB = require('./config/db')
dotenv.config()

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World')
})

const startServer = async() => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(3000, ()=>{
    console.log('Server is running on port 3000');
})
    }catch (err){
        console.error('Error starting server:', err)
    }
}

startServer();