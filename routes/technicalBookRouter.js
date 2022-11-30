var express = require("express");
var router = express.Router();

var technical_book_controller = require("../controllers/technicalBookController");
var bookinstances_controller = require("../controllers/bookInstanceController");


router.get("/", technical_book_controller.list);
router.get("/create", technical_book_controller.create_get);
router.post("/create", technical_book_controller.rules,technical_book_controller.create_post);
router.get("/update/:id", technical_book_controller.update_get);
router.post("/update/:id",technical_book_controller.rules, technical_book_controller.update_post);
router.get("/delete/:id", technical_book_controller.delete_get);
router.post("/delete/:id", technical_book_controller.delete_post);

router.get("/instance/:id", bookinstances_controller.list);
router.get("/instance/create/:id", bookinstances_controller.create_get);
router.post("/instance/create/:id", bookinstances_controller.create_post);
router.get("/instance/update/:id", bookinstances_controller.update_get);
router.post("/instance/update/:id", bookinstances_controller.update_post);
router.get("/instance/delete/:id", bookinstances_controller.delete_get);
router.post("/instance/delete/:id", bookinstances_controller.delete_post);



module.exports = router;