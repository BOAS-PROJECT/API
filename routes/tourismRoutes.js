const express = require("express");
const tourismController = require("../controllers/tourismController");
const upload = require("../utils/propertyMulterConfig");
const router = express.Router();

// CREATION DU STIE TOURISTIQUE
router.post("/create", upload.single("image") , tourismController.create);

// LISTE DES STIES TOURISTIQUES
router.get("/list", tourismController.list);

module.exports = router;