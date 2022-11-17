require('dotenv').config({path: '../.env'})
var mongoose = require('mongoose');
var Genre = require("../models/genre");
var Publisher = require("../models/publisher");
var TechnicalBook = require("../models/technicalbook");

// Per carregar dades d'un CSV
// const csv=require('csvtojson')

// Carregar dades de fitxers JSON
var genresJSON = require('./genres.json');
var publishersJSON = require('./publishers.json');
var booksJSON = require('./books.json');

var mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
//mongoose.Promise = global.Promise;
//var db = mongoose.connection;

mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(
    function () {
      console.log('Mongoose connection open'); 

      seeder().then( function() {
        mongoose.connection.close();
      });
      
    }
  )
  .catch("when the error happened")

/*
db.on('connected', function () {
  console.log('Mongoose connection open'); 
  
  seeder().then( function() {
    mongoose.connection.close();
  });

});

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

*/

async function seeder() {
  // Esborrar contingut col·leccions
  await Genre.collection.drop();
  await Publisher.collection.drop();
  await TechnicalBook.collection.drop();

  // versió per CSV
  // const jsonObj = await csv()
  //                 .fromFile('./genres.csv')     
  // genreList = await Genre.insertMany(jsonObj);
  
  var genres = await Genre.insertMany(genresJSON.genres);  
  var publishers = await Publisher.insertMany(publishersJSON.publishers);

  booksJSON.books[0].genre = [genres[0].id,genres[1].id];
  booksJSON.books[0].publisher = publishers[0].id;

  booksJSON.books[1].genre = [genres[1].id,genres[2].id];
  booksJSON.books[1].publisher = publishers[1].id;

  booksJSON.books[2].genre = [genres[3].id,genres[4].id];
  booksJSON.books[2].publisher = publishers[0].id;

  booksJSON.books[3].genre = [genres[0].id];
  booksJSON.books[3].publisher = publishers[0].id;

  booksJSON.books[4].genre = [genres[0].id,genres[1].id,genres[2].id];
  booksJSON.books[4].publisher = publishers[5].id;

  booksJSON.books[5].genre = [genres[0].id,genres[3].id];
  booksJSON.books[5].publisher = publishers[6].id;

  booksJSON.books[6].genre = [genres[0].id,genres[2].id,genres[1].id,genres[2].id];
  booksJSON.books[6].publisher = publishers[4].id;

  booksJSON.books[7].genre = [genres[0].id,genres[1].id];
  booksJSON.books[7].publisher = publishers[4].id;
  
  const books = await TechnicalBook.insertMany(booksJSON.books);
}


 
