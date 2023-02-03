require('dotenv').config({path: '../.env'})
var mongoose = require('mongoose');
var Genre = require("../models/genre");
var Publisher = require("../models/publisher");
var TechnicalBook = require("../models/technicalbook");
var User = require("../models/user");
var BookInstance = require("../models/bookinstance");
var BookLending = require("../models/booklending");
var bcrypt = require('bcryptjs');


// Per carregar dades d'un CSV
// const csv=require('csvtojson')

// Carregar dades de fitxers JSON
var genresJSON = require('./genres.json');
var publishersJSON = require('./publishers.json');
var booksJSON = require('./books.json');
var usersJSON = require('./users.json');

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


async function seeder() {
  // Esborrar contingut col·leccions
  try {
    await BookInstance.collection.drop();
      await Genre.collection.drop();
      await Publisher.collection.drop();
      await TechnicalBook.collection.drop();
      await User.collection.drop();
      await BookLending.collection.drop();
      
  } catch(error) {
      console.log('Error esborrant dades...')
  }

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

  var instances = [];
  var numInstances = 0;
  for(var i =0; i< books.length; i ++) {
      // 3 instances per book
      for(var j=0;j<3;j++) {
        var instance = new BookInstance();
        instance.book = books[i]._id;
        instance.imprintYear  = 2002;
        instance.room = "Library";
        instance.rack = "A1";
        instance.status = "Available";
        instances[numInstances] = await instance.save();
        numInstances++;
        // console.log(instance)
      }
  }

 

  for(var i =0; i<  usersJSON.users.length; i ++) {
    usersJSON.users[i].password =  await bcrypt.hash(usersJSON.users[i].password,12);
  }
  
  const users = await User.insertMany(usersJSON.users);

  j= 0;
  for(var i =0; i<  instances.length; i = i + 3) {
    var lend = new BookLending();
    lend.bookinstance = instances[i]; 
    lend.member = users[j];
    j = (j + 1) % users.length;
    lend.createDate = "2022/10/10" ;
    lend.dueDate = "20022/10/17";
    lend.returnDate = null;
    await lend.save();
    instances[i].status = "Lended";
    await instances[i].save();
  }
  
}


 
