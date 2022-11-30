var TechnicalBook = require("../models/technicalbook");
var BookInstance = require("../models/bookinstance");
var Publisher = require("../models/publisher");
var User = require("../models/user");
const BookLending = require("../models/booklending");

const { body, validationResult } = require("express-validator");


class LendController {

  static rules = [
    // Validate and sanitize fields.
    body("instance", "Title must not be empty.")
      .trim()
      .notEmpty()
      .withMessage('You must select a book item from the list.'), 
    body("member", "Summary must not be empty.")
      .trim()
      .notEmpty()
      .withMessage('You must select a library user.'),    
  ];


  // Obtenir la llista de llibres
  // filtrats per: title o summary, author, genre
  // paginat
  static async bookList(req,res,next) {
    
    try {

        const options = {
          page: req.query.page || 1,
          limit: 6,
          populate: 'publisher genre',
          collation: {
            locale: 'en',
          },
        };   
      
        let filters={titleFilter:"",publisherFilter:"",authorFilter:""};  
        let queryFilters={}; 
      
        const publishers = await Publisher.find();
        
        if(req.query.titleFilter) {
            // Opció 1: Title conté - i (ignoreCase: majúsules i minúscules)
            // queryFilters.title = new RegExp(req.query.titleFilter, 'i') ; 
            
            // opció 2: Title o Summary conté
            // NOTA: per fer ús de $text s'ha de configurar l'Schema !
            queryFilters = {$text: {$search: req.query.titleFilter}}
            filters.titleFilter = req.query.titleFilter;
        }

        if(req.query.publisherFilter) {
            // Cercar les editorials que contenen el text:  equivalent a /textinclou/i
            var publisher_ids = await Publisher.find({name: new RegExp(req.query.publisherFilter, 'i')});
            console.log(publisher_ids)
            // Crear array d'ids de totes les trobades
            const ids = [];
            for(var i =0; i< publisher_ids.length;i++) {
              ids.push(publisher_ids[i]._id);
            }
            
            // filtre amb tots els llibres de les diferents editorials trobades: $in
            queryFilters['publisher']= {$in:ids};      
            filters.publisherFilter = req.query.publisherFilter;
        }

        if(req.query.authorFilter) {
            // cercar per nom o per cognoms
            let query1=[
              {'author.firstname': new RegExp(req.query.authorFilter, 'i')},
              {'author.lastname': new RegExp(req.query.authorFilter, 'i') }
            ];
            // condició amb $or
            queryFilters['$or'] = query1; 
            filters.authorFilter = req.query.authorFilter;
        }       
         
        var result = await TechnicalBook.paginate(queryFilters, options);         
        // Obtenir el número d'exemplars de cada llibre trobat
        
        for(var i=0; i<result.docs.length; i++) {
            var numItems = await BookInstance.count({ book: result.docs[i].id , status:"Available"});
            result.docs[i].numItems = numItems; // afegir l'atribut a cada element del resultat                   

        } 
        res.render('lends/bookList',{result:result, publishers: publishers,filters:filters})  
        
        
    } catch(error) {
        var err = new Error("Error retrieving the book list.");
        err.status = 404;
        return next(error);
    }
 

  }

  // Obtenir llista d'examplars d'una llibre
  static async itemList(req,res,next) {
      try {
        let instancesList = await BookInstance.find({ book: req.params.id })
        let userList = await User.find({})

        var book = await TechnicalBook.findById(req.params.id,"title author")  
            .populate('genre')   
            .populate('publisher') ;         
            
        res.render('lends/itemList',{book:book,instances:instancesList,userList:userList})
          
      } catch(error) {
          var err = new Error("Error retrieving the book items list");
          err.status = 404;
          return next(err);
      }
  }
  
  // Prestar un exemplar d'un llibre a un usuari de la biblioteca  
  static async lendItem(req,res,next) {
    
    // Recuperem els errors possibles de validació
    const errors = validationResult(req);
      
    // Si tenim errors en les dades enviades
    if (!errors.isEmpty()) {
      // Recarreguem la vista amb llista items i llista socis biblioteca
      try {
          let instancesList = await BookInstance.find({ book: req.params.id });
          let userList = await User.find({});

          var book = await TechnicalBook.findById(req.params.id,"title author")  
                .populate('genre')   
                .populate('publisher') ;        
              
          res.render('lends/itemList',{book:book,
                          instances:instancesList,
                          userList:userList,
                          errors: errors.array()})
      } catch(error) {
          var err = new Error("Error retrieving the book items list");
          err.status = 404;
         return next(err);
      }
    }
    else { // S'han emplenat correctament els inputs del formulari
        try {
          // Recuperem l'exemplar del llibre 
           // En cas que no es trobi carregarà vista d'errors
          var instance = await BookInstance.findById(req.body.instance);
          if (instance == null) { // No results                
            var err = new Error("Book item not found");
            err.status = 404;
            return next(err);
          }
                   
          // Recuperem el soci de la biblioteca únicament per comprovar que existeix
          // En cas que no es trobi carregarà vista d'errors
          var user = await User.findById(req.body.member);
          if (user == null) { // No results                
            var err = new Error("Member not found");
            err.status = 404;
            return next(err);
          }

          // Canviem l'estat de l'exemplar del llibre
          instance.status = "Lended";
          await instance.save();

          // Creem un nou registre de prèstec
          var bookLending = new BookLending();
          bookLending.bookinstance = req.body.instance;
          bookLending.member = req.body.member;
          let ts = Date.now();
          bookLending.createDate = ts ;
              // una setmana en prèstec
          bookLending.dueDate = ts +  7 * 24 * 60 * 60 * 1000 ;
          bookLending.returnDate = null;
          await bookLending.save();

          res.redirect('/lend/lendlist');
        
        } catch(error) {
            var err = new Error("There was a problem lending this book item.");
            err.status = 404;
            return next(err);
        }
      }
    }
      
    // Llista de llibres que estan actulment en prèstec
    static async lendList(req,res,next) {

        BookLending.find({returnDate:null}) 
          .sort('-dueDate')
          .populate(
              { 
                path: 'bookinstance',
                populate: {
                  path: 'book',
                  model: 'TechnicalBook',
                  populate: {
                      path: 'publisher',
                      model: 'Publisher'
                      
                    } 
                } 
            }
          )  
            .populate('member')
            .exec(function (err, list) {
              if (err) {
                var err = new Error("There was a problem retrieving the list of lended book items.");
                err.status = 404;
                return next(err);
              }
                          
              res.render('lends/lenderList',{list:list})
          }); 
   }
  
  
  // Retornar un exemplar
  static async lendReturn(req,res,next) {
    try {
        // busquem registre del prèstec
        var lending = await BookLending.findById(req.params.id);
        
        // assignem data retorn
        let ts = Date.now();
        lending.returnDate = ts;
        await lending.save();

        // Canviem l'estat del llibre
        var instance = await BookInstance.findById(lending.bookinstance);
        instance.status = "Available";
        await instance.save();       
      
        res.redirect('/lend/lendlist');

    } catch(error) {
      var err = new Error("There was a problem returning this book item.");
      err.status = 404;
      return next(err);
    }
    
  }


  // Recuperem la llista de prèstecs d'un usuari concret
  static async borrowList(req,res,next) {

    BookLending.find({ member: req.session.data.userId}) 
       .sort('-dueDate')
       .populate(
          { 
            path: 'bookinstance',
            populate: {
              path: 'book',
              model: 'TechnicalBook',
              populate: {
                  path: 'publisher',
                  model: 'Publisher'
                  
                } 
            } 
        }
       )  
        .populate('member')
        .exec(function (err, list) {
          if (err) {
            return next(err);
          }
          
          //res.send(list);
          res.render('borrows/borrowedList',{list:list})
      }); 
  
  }


}

module.exports = LendController;
