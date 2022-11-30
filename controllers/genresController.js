var Genre = require("../models/genre");

const { body, validationResult } = require("express-validator");


class GenreController {

  static rules = [
    // Validate and sanitize fields.
    body("name")
      .trim()
      .isLength({ min: 1})
      .withMessage('Name must not be empty.')   
      .isLength({ max: 20})
      .withMessage('Name is too long.')       
      .escape()           
      .custom(async function(value, {req}) {  
               
          const genre = await Genre.findOne({name:value});          
          if (genre) {
            if(req.params.id!==genre.id ) {
              throw new Error('This gender name already exists.');
            }                  
          }
          return true;        
      })    
    
  ];


  // Version 1
  static async list(req,res,next) {
    /*
      try {
        var list_genres = await Genre.find();
        res.render('genres/list',{list:list_genres})   
      }
      catch(e) {
        res.send('Error!');
      }  
      */
     const options = {
      page: req.query.page || 1,
      limit: 10,
      collation: {
        locale: 'en',
      },
    };
    Genre.paginate({}, options, function (err, result) {
            if (err) {
            return next(err);
          }  
   
          res.render('genres/list',{result:result}) 
    
    }); 		        
  }

  
  // Version 2
  /*
  	static list(req,res,next) {
  		Genre.find()        
          .exec(function (err, list_genres) {
            if (err) {
              return next(err);
            }
            
            res.render('genres/list',{list:list_genres})
        }); 		
  	}
  */

  static create_get(req, res, next) {
      // Per renderitzar el primer cop la vista amb dades
      var gender = {
        "name" : ""
      }
      res.render('genres/new',{gender:gender});
  }

  // version 1
  /*
  static async create_post(req, res) {
   
    try {
      var genre = new Genre({ name: req.body.name });
      await genre.save();
      res.redirect('/genres') 
    }
    catch(error) {
      res.send(error.message);
    }
    
  }
  */

  // version 2
  /*
  static async create_post(req, res) {
   
    try {
      var newGender = await Genre.create({ name: req.body.name });
      console.log(newGender)
      res.redirect('/genres') 
    }
    catch(error) {
       res.render('genres/new',{error: error.message})
    }
    
  }
  */

  // version 3: sense async/await
  
  static create_post(req, res,next) {
      // Recuperem els errors possibles de validació
      const errors = validationResult(req);
      // console.log(errors.array())
      // Tenim errors en les dades enviades
    
      if (!errors.isEmpty()) {
        var gender = {
          "name" : req.body.name
        }
        res.render('genres/new',{errors:errors.array(), gender: gender})
      }
      else {
            
            Genre.create(req.body, function (error, newGenre)  {
                if(error){
                  var err = new Error("There was a problem saving the new genre.");
                  err.status = 404;
                  return next(err);
                }else{             
                    res.redirect('/genres')
                }
            })  
      }  
  }
  

  static update_get(req, res, next) {
    
      Genre.findById(req.params.id, function (err, genre) {
          if (err) {
            return next(err);
          }
          if (genre == null) {
            // No results.
            var err = new Error("Genre not found");
            err.status = 404;
            return next(err);
          }
          // Success.
          res.render("genres/update", { genre: genre });
      });
      
  }  

  static update_post(req, res, next) {
      const errors = validationResult(req);

      var genre = new Genre({
        name: req.body.name,
        _id: req.params.id,  // Necessari per a que sobreescrigui el mateix objecte!
      });
          
      if (!errors.isEmpty()) {
        res.render("genres/update", { genre: genre, errors:errors.array() });
              
      }
      else {
          Genre.findByIdAndUpdate(
            req.params.id,
            genre,
            {runValidators: true}, // comportament per defecte: buscar i modificar si el troba sense validar l'Schema
            function (err, genreFound) {
              if (err) {
                //return next(err);
                res.render("genres/update", { genre: genre, error: err.message });

              }          
              //res.redirect('/genres/update/'+ genreFound._id);
              res.render("genres/update", { genre: genre, message: 'Genre Updated'});
            }
          );
      }
  }

  static async delete_get(req, res, next) {
     res.render('genres/delete',{id: req.params.id})
  }

  static async delete_post(req, res, next) {
    
    Genre.findByIdAndRemove(req.params.id, function (error) {
      if(error){
        var err = new Error("Error deleting Genre");
        err.status = 404;
        return next(err);
      }else{
        res.redirect('/genres')
      }
    }) 
  }

}

module.exports = GenreController;
