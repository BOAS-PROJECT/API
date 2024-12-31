const express = require("express");
const leisureController = require("../controllers/leisureController");
const router = express.Router();

// LISTE DES LOISIRS
router.get("/list", leisureController.list);

// RESERVATION D'UN LOISIR
router.post("/reservation", leisureController.reservation);

module.exports = router;