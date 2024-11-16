const express = require("express");
const carmovingController = require("../controllers/carmovingController");
const upload = require("../utils/carMulterConfig");
const router = express.Router();

// CRÉATION DU VÉHICULE
router.post("/create",  upload.single("image"), carmovingController.create);

// LISTE DES VÉHICULES
router.get("/list", carmovingController.list);

module.exports = router;