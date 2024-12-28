const express = require("express");
const tourismController = require("../controllers/tourismController");
const upload = require("../utils/tourismMulterConfig");
const router = express.Router();

// CREATION DU sites TOURISTIQUE
router.post("/create", upload.single("image") , tourismController.create);

// LISTE DES SITES TOURISTIQUES
router.get("/list", tourismController.list);

// RESERVATION DU BIEN
router.post("/reservation", tourismController.reservation);

module.exports = router;