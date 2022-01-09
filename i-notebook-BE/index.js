// Connecting to Mongo DB
const connectToMongo = require("./db");
connectToMongo();

// Hosting the server
const express = require('express')
const app = express()
const port = 5000

app.use(express.json());

// Available routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})