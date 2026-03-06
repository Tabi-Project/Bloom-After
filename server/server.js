const express = require('express')
const cloudinary = require('cloudinary').v2

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})