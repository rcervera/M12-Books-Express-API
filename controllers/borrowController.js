var TechnicalBook = require("../models/technicalbook");
var BookInstance = require("../models/bookinstance");
var Publisher = require("../models/publisher");
var User = require("../models/user");
const BookLending = require("../models/booklending");

class BorrowController {

 
  // Obtenir la llista de llibres
  // filtrats per: title o summary, author, genre
  // paginat
  static async bookList(req,res,next) {
    
    try {

        const options = {
          page: req.query.page || 1,
          limit: 9,
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

module.exports = BorrowController;
