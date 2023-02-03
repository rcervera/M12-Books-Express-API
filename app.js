var express = require('express');
var path = require('path');
var dotenv = require('dotenv');
var session = require('express-session');
var mongoose = require('mongoose');

var cors = require('cors')


var publisherRouter = require('./routes/publisherRouter');



var app = express();
app.use(cors())

dotenv.config();


var mongoDB = process.env.MONGODB_URI;
    
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
   

//app.use(express.urlencoded({ extended: true }));

app.use(express.json());


app.use(express.static(path.join(__dirname + '/public')));


app.get('/',function(req, res) {  
     res.send('API VERSION')
});


app.use('/publisher', publisherRouter);




module.exports = app;
