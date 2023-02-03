var Publisher = require("../models/publisher");
const { body, validationResult } = require("express-validator");

class publisherController {

  static rules = [
    // Validate and sanitize fields.
    body("name")
      .trim()
      .isLength({ min: 1})
      .withMessage('Name must not be empty.')   
      .isLength({ max: 25})
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


  // Recuperar tots els Publishers
  static async all(req, res, next) {
  
    try {
      const result = await Publisher.find();
      res.status(200).json(result) 
    }
    catch(error) {
      res.status(402).json({errors: [{msg:"There was a problem retrieving publishers."}]})
    }   
  }

  // Recuperar els publishers en pàgines
	static async list(req, res, next) {
      
      // Configurar la paginació
      const options = {
        page: req.query.page || 1,  // Número pàgina
        limit: 5,       // Número registres per pàgina
        sort: { _id: -1 },   // Ordenats per id: el més nou el primer        
      };

      try {
        const result = await Publisher.paginate({}, options);
        res.status(200).json(result) 
      }
      catch(error) {      
        res.status(402).json({errors: [{msg:"There was a problem retrieving publishers."}]})       
      }    		
	}
   

  static async create(req, res, next) {
   
    const errors = validationResult(req);  
   

    if (!errors.isEmpty()) {
        res.status(402).json({errors:errors.array()}) 
    }
    else {    
        var publisher = {
          "name" : req.body.name
        }

        try {
          const newPublisher = await Publisher.create(req.body)
          res.status(200).json(newPublisher)
        } catch(error) {
          res.status(402).json({errors: [{msg:"There was a problem saving the new publisher."}]})          
        }        
    }
  }

  
  static async update(req, res, next) {
    const errors = validationResult(req);  

    if (!errors.isEmpty()) {      
      res.status(402).json({errors:errors.array()})      
    }
    else {    
      
      var publisher = {
        name : req.body.name,
        _id: req.params.id,
      }

      try {
            const updatedpublisher = await Publisher.findByIdAndUpdate(
                   req.params.id, publisher, {runValidators: true})
            return res.status(200).json(updatedpublisher)
      }
      catch(error) {
        res.status(402).json({errors: [{msg:"There was a problem updating the publisher."}]})          
      }
         
    }
      
  }
  
  static async delete(req, res, next) {

    try {       
      const publisher = await  Publisher.findByIdAndRemove(req.params.id)
      res.status(200).json(publisher)
    }
    catch {
      res.status(402).json({errors: [{msg:"There was a problem deleting the publisher."}]})
    }   
    
  }

}

module.exports = publisherController;
