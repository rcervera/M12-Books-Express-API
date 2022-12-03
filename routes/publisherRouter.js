var express = require("express");
var router = express.Router();

const publisher_controller = require("../controllers/publisherController");


router.get("/", publisher_controller.list);
router.get("/new", publisher_controller.create_get);
router.post("/save", publisher_controller.rules, publisher_controller.create_post);
router.get("/delete/:id", publisher_controller.delete_get);
router.post("/delete/:id", publisher_controller.delete_post);
router.get("/update/:id", publisher_controller.update_get);
router.post("/update/:id", publisher_controller.rules,publisher_controller.update_post);


module.exports = router;