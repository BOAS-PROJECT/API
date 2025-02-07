const express = require("express");
const leisureController = require("../controllers/leisureController");
const upload = require("../utils/leisureMulterConfig");
const router = express.Router();

// LISTE DES LOISIRS
router.get("/list", leisureController.list);

// RESERVATION D'UN LOISIR
router.post("/reservation", leisureController.reservation);

// CREATION
router.post("/create", upload.single("image"), leisureController.create);

module.exports = router;