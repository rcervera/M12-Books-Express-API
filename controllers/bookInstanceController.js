var BookInstance = require("../models/bookinstance");
var TechnicalBook = require("../models/technicalbook");
// var Author = require("../models/author");

class bookInstancesController {

    // Buscar instàncies d'un llibre en concret segons paràmetre
	static async list(req, res, next) {
		
	  let instancesList = await BookInstance.find({ book: req.params.id })
	 
	  TechnicalBook.findById(req.params.id,"title author")  
        .populate('genre')         
        .exec(function (err, book) {
          if (err) {
            return next(err);
          }
         
          res.render('bookInstances/list',{book:book,instances:instancesList})
      }); 
	}

	static async create_get(req, res, next) {    
        const book = await TechnicalBook.findById(req.params.id).populate('publisher');    
        res.render('bookInstances/new',{book:book})       
     }

    static async create_post(req, res, next) {    
        const book = await TechnicalBook.findById(req.params.id);        
        var instancebook = new BookInstance({
                book: req.params.id,
                imprintYear: req.body.imprintYear,
                status: req.body.status,        
        });
        instancebook.save(function (err) {
            if (err) {
            return next(err);
            }
            res.redirect('/technicalbook/instance/'+req.params.id)
         });
  }

  static async update_get(req, res, next) {
  		BookInstance.findById(req.params.id)  
        .populate(
            { 
                path: 'book',
                populate: {
                  path: 'publisher',
                  model: 'Publisher'
                } 
             }
        )      
        .exec(function (err, bookInstance) {
          if (err) {
            return next(err);
          }
          // Successful, so render.
          res.render("bookInstances/update", { instance: bookInstance
        });
    }); 
  }

	static async update_post(req, res, next) {

		var book_instance = new BookInstance({
        imprintYear: req.body.imprintYear,
        status: req.body.status,
        _id: req.params.id, // This is required, or a new ID will be assigned!
        });


        BookInstance.findByIdAndUpdate(
            req.params.id,
            book_instance,
            {},
            function (err, updatedInstance) {
            if (err) {
                return next(err);
            }
            
            res.redirect('/technicalbook/instance/'+updatedInstance.book._id);
            }
         );

  }

  static async delete_get(req, res, next) {
  		BookInstance.findById(req.params.id)  
	        .populate('book')      
	        .exec(function (err, bookInstance) {
	          if (err) {
	            return next(err);
	          }
	          // Successful, so render.
	          res.render("bookInstances/delete", { instance: bookInstance
	        });
    	}); 


  }

  static async delete_post(req, res, next) {

  	//const book = await TechnicalBook.findById(req.params.id);
    

  	BookInstance.findByIdAndRemove(req.params.id, (error, instance)=> {
      if(error){
        res.redirect('/technicalbook/instance/'+req.params.id);
        
      }else{
        res.redirect('/technicalbook/instance/'+instance.book._id);
        //res.send(instance);
      }
    })

  }

  
  

}

module.exports = bookInstancesController;
