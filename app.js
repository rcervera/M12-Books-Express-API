var express = require('express');
var path = require('path');
var dotenv = require('dotenv');
var session = require('express-session');
var mongoose = require('mongoose');

var app = express();

// Client i servidor s'executen en diferents ports
// Apareixen problemes amb Cross-Origin Resource Sharing
// El paquet 'cors' habilita cors amb possibilitat de passar diferents opcions
var cors = require('cors')
app.use(cors())


// Connexió BD MONGO
dotenv.config();
var mongoDB = process.env.MONGODB_URI;    
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on("error", function () {
  console.log("Connection error!!");
  process.exit(1);
});
db.once("open", function () {
  console.log("Connected successfully");
}); 

// Format intercanvi de dades JSON
app.use(express.json());

// Ruta de prova
app.get('/',function(req, res) {  
     res.send('API VERSION')
});

// Rutes CRUD per gestionar taula bàsica
var publisherRouter = require('./routes/publisherRouter');
app.use('/publisher', publisherRouter);


module.exports = app;
