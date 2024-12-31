const express = require("express");
const leisureController = require("../controllers/leisureController");
const router = express.Router();

// LISTE DES LOISIRS
router.get("/list", leisureController.list);

module.exports = router;