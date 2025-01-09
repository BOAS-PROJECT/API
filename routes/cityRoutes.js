const express = require("express");
const cityController = require("../controllers/cityController");
const router = express.Router();

// LISTE DES VILLES
router.get("/list", cityController.list);

module.exports = router;