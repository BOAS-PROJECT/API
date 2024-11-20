const express = require("express");
const pharmacyController = require("../controllers/pharmacyController");
const router = express.Router();

// CRÉATION DE LA PHARMACIE
router.post("/create", pharmacyController.create);

// LISTE DES PHARMACIES PNR
router.get("/list-pnr", pharmacyController.listpnr);

// LISTE DES PHARMACIES BZV
router.get("/list-bzv", pharmacyController.listBzv);

module.exports = router;
