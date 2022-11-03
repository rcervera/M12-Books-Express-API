var TechnicalBook = require("../models/technicalbook");
var Genre = require("../models/genre");
var Publisher = require("../models/publisher");

const { body, validationResult } = require("express-validator");


class technicalBookController {

  static rules = [
    // Validate and sanitize fields.
    body("title", "Title must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),  
    body("summary", "Summary must not be empty.")
      .trim()
      .isLength({ min: 1 })
      ,
    body("isbn")
      .trim() 
      .isISBN()   
      .withMessage('ISBN must have a valid format.')        
      .custom(async function(value, {req}) {
         
          const book = await TechnicalBook.findOne({isbn:value});
          
          if (book) {
            if(req.params.id!==book.id ) {
              throw new Error('ISBN already in use.');
            }             
            
          }
          return true;        
      }).withMessage('ISBN must be unique.'),
      
    body("author.*.firstname")
      .trim()   
      .escape(),
    body("author.*.lastname")
      .trim()   
      .escape(),
    body("genre")
      .isArray({min:1})
      .withMessage('You must select at least one genre.'),
  ];



  // Obté la llista de tots els llibres tècnics  
	static async list(req, res, next) {
		
  		TechnicalBook.find()  
          .populate('publisher')  // Carregar les dades de l'objecte Publisher amb el que està relacionat    
          .populate('genre') // i les de tots els objectes gèneres relaciponats
          .exec(function (err, list) {
            // En cas d'error
            if (err) {
              // Crea un nou error personalitzat
              var err = new Error("There was an unexpected problem retrieving your book list");
              err.status = 404;
              // i delega el seu tractament al gestor d'errors
              return next(err);
            }
            // Tot ok: mostra el llistat
            return res.render('technicalbooks/list',{list:list})
      }); 

	}

  // Mostrar formulari per donar d'alta un nou llibre
  static async create_get(req, res, next) {

      // Fem anar la versió async-wait per recuperar dades
      // Els errors s'han de capturar amb try-catch
      try {
          const genres_list = await Genre.find();
          const publisher_list = await Publisher.find();

          // En blanc, per renderitzar el formulari el primer cop
          // i que les variables existeixin a la vista
          var technicalbook = {
              title: '',
              author: [
                { firstname: '', lastname: '' },
                { firstname: '', lastname: '' },
                { firstname: '', lastname: '' },
                { firstname: '', lastname: '' }
              ],
              publisher: {},
              summary: '',
              isbn: '',
              genre: [],
          };
          
          // mostrem el formulari i li passem les dades necessàries
          return res.render('technicalbooks/new',
            {genresList:genres_list,
             publisherList:publisher_list,
             techBook: technicalbook
            })
      }
      catch(error) {
        // En cas d'error al recuperar els llistats necessaris
        // li diem al gestor d'errors que el tracti...
        var err = new Error("There was a problem showing the new book form");
        err.status = 404;
        return next(err);
        
      }
  }


  // Afegim un nou llibre a la base de dades
  static async create_post(req, res, next) {

      // Recuperem els errors possibles de validació
      const errors = validationResult(req);
      
      // Tenim errors en les dades enviades
      if (!errors.isEmpty()) {

        try {
          // Recupero llistats necessaris
          var genres_list = await Genre.find();
          var publisher_list = await Publisher.find();
      

          // Si no s'ha seleccionat cap checkbox 
          // hem de tenir en compte que la variable req.body.genre no existirà      
          if (typeof req.body.genre === "undefined") req.body.genre = [];
              
          // mostro formulari i li passo llistats
          // i els errors en format array per mostrar-los a usuari
          res.render('technicalbooks/new',
                {genresList:genres_list,
                 publisherList:publisher_list,
                 errors: errors.array(),
                 techBook:req.body})
        }
        catch(error) {
            var err = new Error("There was a problem showing the new book form");
            err.status = 404;
            return next(err);
      
        }
               
      }
      else // cap errada en el formulari
      {    
        // Crear un array amb únicament els autors emplenats
        const authors = [];
        req.body.author.forEach(function(author) {
            if(author.firstname!="" || author.lastname!="") 
              authors.push(author);                            
        }); 
        req.body.author = authors;      

        // Si no s'ha seleccionat cap checkbox  
        if (typeof req.body.genre === "undefined") req.body.genre = [];
              
        try {      
          // req.body.title=""; // Descomenta per generar un error per provar
          var newTechnicalBook = await TechnicalBook.create(req.body);
          res.redirect('/technicalbook') 
        }
        catch(error) {
          var err = new Error("There was an unexpected problem saving your book");
          err.status = 404;
          return next(err);
        }     
      
      }
  }

  
  // Mostrar el formulari per actualitzar un llibre
  static async update_get(req, res, next) {

    try {
        const genres_list = await Genre.find();
        const publisher_list = await Publisher.find();
        const book = await TechnicalBook.findById(req.params.id) 
                     .populate('publisher');
          
        if (book == null) { // No results                
          var err = new Error("Technical Book not found");
          err.status = 404;
          return next(err);
        }
        // Successful, so render.
        res.render("technicalbooks/update", { 
                  techBook: book, 
                  genresList:genres_list,
                  publisherList:publisher_list });
        
    }
    catch(error) {
      var err = new Error("There was an unexpected problem showing the selected book");
      console.log(error)
      err.status = 404;
      next(err)
    }
    
  }

  // Actualitzar el llibre a la base de dades
  
  static async update_post(req, res, next) {

    try {

      var genres_list = await Genre.find();
      var publisher_list = await Publisher.find();

      // Només desaré els autors que s'han emplenat!
      const authors = [];
      req.body.author.forEach(function(author) {
              if(author.firstname!="" || author.lastname!="") 
                authors.push(author);                            
      }); 
              
      const technicalbook = new TechnicalBook({
          title: req.body.title,
          author: authors,
          summary: req.body.summary,
          isbn: req.body.isbn,
          genre: req.body.genre,
          _id: req.params.id, // This is required, or a new ID will be assigned!
      });

      // Si no s'ha seleccionat cap checkbox      
      if (typeof technicalbook.genre === "undefined") technicalbook.genre = [];
      

      const errors = validationResult(req);
        
      if (!errors.isEmpty()) {
                     
          res.render('technicalbooks/update',
                { techBook: technicalbook, 
                  errors: errors.array(),
                  genresList:genres_list,
                  publisherList:publisher_list });                 
      }
      else
      {           
        
        TechnicalBook.findByIdAndUpdate(
            req.params.id,
            technicalbook,
            {},
            function (err, updatedBook) {
              if (err) {
                return next(err);
              }
              res.render('technicalbooks/update',
                  { techBook: technicalbook, 
                    message: 'Technical Book Updated',
                    genresList:genres_list,
                    publisherList:publisher_list });
            
            });
      }
    }
    catch(error) {
      var err = new Error("There was an unexpected problem updating the book");
      err.status = 404;
      next(err)
    }
   
  }

  // Mostrar formulari per confirmar esborrat
  static delete_get(req, res, next) {

    res.render("technicalbooks/delete",{id: req.params.id});
  
  }

  // Esborrar llibre de la base de dades
  static async delete_post(req, res, next) {
    
    TechnicalBook.findByIdAndRemove(req.params.id, function (error) { 
      if(error){
        var error = new Error("There was an unexpected problem deleting the book");
        error.status = 404;
        next(error)
      }else{
        
        res.redirect('/technicalbook')
      }
    }) 
  }



}

module.exports = technicalBookController;
