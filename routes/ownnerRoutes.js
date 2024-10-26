const express = require("express");
const ownerController = require("../controllers/ownerController");
const upload = require("../utils/ownerMulterConfig");
const router = express.Router();

// CREATION DU COMPTE
router.post("/create", upload.single("cni"), ownerController.create);

// LISTE DES PROPRIETAIRES
router.get("/list-owners", ownerController.listOwners);

module.exports = router;