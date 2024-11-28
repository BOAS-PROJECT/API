const express = require("express");
const tourismController = require("../controllers/tourismController");
const upload = require("../utils/propertyMulterConfig");
const router = express.Router();

// CREATION DU sites TOURISTIQUE
router.post("/create", upload.single("image") , tourismController.create);

// LISTE DES SITES TOURISTIQUES
router.get("/list", tourismController.list);

module.exports = router;