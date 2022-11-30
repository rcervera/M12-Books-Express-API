var express = require("express");
var middelware = require("../middlewares/authenticate");
var router = express.Router();

const lend_controller = require("../controllers/lendController");

router.use([middelware.isAuth,middelware.hasRole('lender')]);

router.get("/search", lend_controller.bookList);
router.get("/selectitem/:id", lend_controller.itemList);
router.post("/lenditem/:id", lend_controller.rules, lend_controller.lendItem); 
router.get("/lendlist", lend_controller.lendList); 
router.get("/return/:id", lend_controller.lendReturn); 
router.get("/borrowlist", lend_controller.borrowList); 

module.exports = router;