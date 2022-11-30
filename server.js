var express = require('express');
var path = require('path');
var dotenv = require('dotenv');
var session = require('express-session');

var indexRouter = require('./routes/indexRouter');
var genresRouter = require('./routes/genresRouter');
var publisherRouter = require('./routes/publisherRouter');
var technicalBookRouter = require('./routes/technicalBookRouter');
var authRouter = require('./routes/authRouter'); 
var lendRouter = require('./routes/lendRouter'); 
var borrowRouter = require('./routes/borrowRouter'); 


var app = express();

dotenv.config();

const port = process.env.PORT || 8000;

// Set up mongoose connection
var mongoose = require('mongoose');
var mongoDB = process.env.MONGODB_URI;

mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
//mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// Set up session
app.use(session({
     secret: process.env.SECRET,
     resave: false,
     name: 'M12',
     saveUninitialized: true,
     cookie: { maxAge: 1000*60*60 },
   }))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + '/public')));




function middleware1(req, res, next) {
     console.log('middelware 1')
     next(); 
}

function middleware2(req, res, next) {
     console.log('middelware 2')
     next(); 
}

// app.use(middleware1);
// app.use(middleware2);
/*
app.get('/prova', [middleware1,middleware2],function(req, res) {  
  res.send('prova')
});
*/




const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.use(function (req, res, next) {
     console.log(req.session.data);
     
     if(req.session.data) {
       res.locals.userId = req.session.data.userId;
       res.locals.fullname = req.session.data.fullname;
       res.locals.role = req.session.data.role;
       console.log(res.locals.role)
        
     }
     next(); 
    
});


app.get('/',function(req, res) {  
     res.render('home')
});

app.use('/home', indexRouter);
app.use('/genres', genresRouter);
app.use('/publisher', publisherRouter);
app.use('/technicalbook', technicalBookRouter);
app.use('/auth', authRouter);
app.use('/lend', lendRouter);
app.use('/borrow', borrowRouter);

/*
const provaError = (err, req, res, next) => {
 
     console.log('Hi ha hagut un error!') 
     next(err);
}
*/



function errorResponder(err, req, res, next) {
 
     res.render('errors/error',{error:err}) 
}

// app.use(provaError)
app.use(errorResponder)



module.exports = app;
