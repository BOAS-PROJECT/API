const express = require("express");
const taxiController = require("../controllers/taxiController");
const upload = require("../utils/taxiMulterConfig");
const router = express.Router();

// CREATION DU TAXI
router.post("/create",  upload.single("image"), taxiController.create);

// LISTE DES TAXIS
router.get("/list", taxiController.list);

module.exports = router;
