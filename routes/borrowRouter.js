var express = require("express");
var middelware = require("../middlewares/authenticate");
var router = express.Router();

const borrow_controller = require("../controllers/borrowController");

router.use([middelware.isAuth,middelware.hasRole('member')]);

router.get("/search", borrow_controller.bookList);
router.get("/borrowlist", borrow_controller.borrowList); 

module.exports = router;