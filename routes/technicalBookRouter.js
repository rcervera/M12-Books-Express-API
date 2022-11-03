var express = require("express");
var router = express.Router();

var technical_book_controller = require("../controllers/technicalBookController");



router.get("/", technical_book_controller.list);
router.get("/create", technical_book_controller.create_get);
router.post("/create", technical_book_controller.rules,technical_book_controller.create_post);
router.get("/update/:id", technical_book_controller.update_get);
router.post("/update/:id",technical_book_controller.rules, technical_book_controller.update_post);
router.get("/delete/:id", technical_book_controller.delete_get);
router.post("/delete/:id", technical_book_controller.delete_post);


module.exports = router;