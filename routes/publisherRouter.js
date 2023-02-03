var express = require("express");
var router = express.Router();

const publisher_controller = require("../controllers/publisherController");

router.get("/", publisher_controller.list);
router.get("/all", publisher_controller.all);
router.post("/", publisher_controller.rules, publisher_controller.create);
router.delete("/:id", publisher_controller.delete);
router.put("/:id", publisher_controller.rules,publisher_controller.update);


module.exports = router;