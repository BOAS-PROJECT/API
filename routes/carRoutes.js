const express = require("express");
const carController = require("../controllers/carController");
const upload = require("../utils/carMulterConfig");
const router = express.Router();

// CREATION DU VÉHICULE
router.post("/create",  upload.single("image"), carController.create);

module.exports = router;