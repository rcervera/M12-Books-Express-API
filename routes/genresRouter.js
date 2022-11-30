var express = require("express");
var middelware = require("../middlewares/authenticate");
var router = express.Router();

const genre_controller = require("../controllers/genresController");

router.use([middelware.isAuth,middelware.hasRole('librarian')]);
/*
router.use(function (req, res, next) {
    //console.log(req.session.data.userId);
    
    if(!req.session.data) {
        res.redirect('/user/login')
    }
    else {
        // console.log(req.session.data);
        // res.locals.username = req.session.data.username;
      next();  
    }   
});
*/

router.get("/", genre_controller.list);

router.get("/create", genre_controller.create_get);
router.post("/create", genre_controller.rules,genre_controller.create_post);

router.get("/delete/:id", genre_controller.delete_get);
router.post("/delete/:id", genre_controller.delete_post);

router.get("/update/:id", genre_controller.update_get);
router.post("/update/:id", genre_controller.rules, genre_controller.update_post);


module.exports = router;