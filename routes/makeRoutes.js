const express = require("express");
const makeController = require("../controllers/makeController");
const router = express.Router();

// CREATION DU COMPTE
router.post("/create", makeController.create);

module.exports = router;