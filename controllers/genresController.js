var Genre = require("../models/genre");

class GenreController {

  // Version 1
  static async list(req,res,next) {
    try {
      var list_genres = await Genre.find();
      res.render('genres/list',{list:list_genres})   
    }
    catch(e) {
      res.send('Error!');
    }          
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
      res.render('genres/new');
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
  
  static create_post(req, res) {
    // console.log(req.body)
    Genre.create(req.body, function (error, newGenre)  {
        if(error){
            //console.log(error)
            res.render('genres/new',{error:error.message})
        }else{             
            res.redirect('/genres')
        }
    })    
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
      var genre = new Genre({
        name: req.body.name,
        _id: req.params.id,  // Necessari per a que sobreescrigui el mateix objecte!
      });    
    
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

  static async delete_get(req, res, next) {
     res.render('genres/delete',{id: req.params.id})
  }

  static async delete_post(req, res, next) {
    
    Genre.findByIdAndRemove(req.params.id, function (error) {
      if(error){
        res.redirect('/genres')
      }else{
        res.redirect('/genres')
      }
    }) 
  }

}

module.exports = GenreController;
