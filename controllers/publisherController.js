var Publisher = require("../models/publisher");
const { body, validationResult } = require("express-validator");


class publisherController {

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
               
          const publisher = await Publisher.findOne({name:value});          
          if (publisher) {
            if(req.params.id!==publisher.id ) {
              throw new Error('This publisher name already exists.');
            }                  
          }
          return true;        
      })    
    
  ];

	static list(req, res, next) {
		Publisher.find()        
        .exec(function (err, list) {
          if (err) {
            return next(err);
          }
          
          res.render('publishers/list',{list:list})
      }); 
		
	}

  static create_get(req, res, next) {
      var publisher = {
        "name" : ""
      }
      res.render('publishers/new',{publisher:publisher});
  }

  

  static create_post(req, res, next) {
    // Recuperem els errors possibles de validació
    const errors = validationResult(req);
    // console.log(errors.array())
    // Tenim errors en les dades enviades
  
    if (!errors.isEmpty()) {
      var publisher = {
        "name" : req.body.name
      }
      res.render('publishers/new',{errors:errors.array(), publisher: publisher})
    }
    else {    
        Publisher.create(req.body, (error, newRecord) => {
            if(error){
                //var err = new Error("There was a problem saving the new publisher.");
                //err.status = 404;
                return next(error);
            }else{                
                res.redirect('/publisher')
            }
        })
    }
  }

  static update_get(req, res, next) {
    Publisher.findById(req.params.id, function (err, publisher) {
        if (err) {
          return next(err);
        }
        if (publisher == null) {
          // No results.
          var err = new Error("Publisher not found");
          err.status = 404;
          return next(err);
        }
        // Success.
        res.render("publishers/update", { publisher: publisher });
    });
      
  }

  static update_post(req, res, next) {
      var publisher = new Publisher({
        name: req.body.name,
        _id: req.params.id,
      });    
    
      Publisher.findByIdAndUpdate(
        req.params.id,
        publisher,
        {},
        function (err, thepublisher) {
          if (err) {
            res.render("publishers/update", { publisher: publisher, error: err.message });

          }
          res.render("publishers/update", { publisher: publisher, message: 'Publisher Updated'});
        
        }
      );
  }

  static async delete_get(req, res, next) {
      
      res.render('publishers/delete',{id: req.params.id})
  }

  static async delete_post(req, res, next) {
    
    Publisher.findByIdAndRemove(req.params.id, (error)=> {
      if(error){
        res.redirect('/publisher')
      }else{
        res.redirect('/publisher')
      }
    }) 
  }

}

module.exports = publisherController;
