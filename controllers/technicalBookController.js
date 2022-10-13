var TechnicalBook = require("../models/technicalbook");
var Genre = require("../models/genre");
var Publisher = require("../models/publisher");

var async = require("async");

class technicalBookController {

	static async list(req, res, next) {
		

		TechnicalBook.find()  
        .populate('publisher')      
        .exec(function (err, list) {
          if (err) {
            return next(err);
          }
          res.render('technicalbooks/list',{list:list})
    }); 


	}

  static async create_get(req, res, next) {

    const genres_list = await Genre.find();
    const publisher_list = await Publisher.find();
    
    res.render('technicalbooks/new',{genresList:genres_list,
              publisherList:publisher_list})
      
  }

  static async create_post(req, res, next) {
      
      const genres_list = await Genre.find();
      const publisher_list = await Publisher.find();
    
      // Crear un array amb únicament els autors emplenats
      const authors = [];
      req.body.author.forEach(function(author) {
          if(author.firstname!="" || author.lastname!="") 
            authors.push(author);                            
      }); 

      
      var technicalbook = {
        title: req.body.title,
        author: authors,
        publisher: req.body.publisher,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: req.body.genre,
      };

      
      try {
      
        var newTechnicalBook = await TechnicalBook.create(technicalbook);
        res.redirect('/technicalbook') 
      }
      catch(error) {
        res.render('technicalbooks/new',{genresList:genres_list,
              publisherList:publisher_list,error: error.message})
           

      }
        
     
      
      
  }



  static delete_get(req, res, next) {
  
  }

  static delete_post(req, res, next) {
    
  }

  
  
  static async update_get(req, res, next) {
    
      
  }

  static async update_post(req, res, next) {
   
  }



}

module.exports = technicalBookController;
