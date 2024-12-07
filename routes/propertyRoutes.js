const express = require("express");
const propertyController = require("../controllers/propertyController");
const upload = require("../utils/propertyMulterConfig");
const router = express.Router();

// CREATION DU TYPE DE BIEN
router.post("/create-type", propertyController.createtype);

// CREATION DU BIEN
router.post("/create", upload.single("image"), propertyController.create);

// CREATION DU PROPRIETAIRE DU BIEN
router.post("/create-owner", propertyController.createOwner);

// LISTE DES BIENS
router.get("/list", propertyController.list);

// RESERVATION DU BIEN
router.post("/reservation", propertyController.reservation);

module.exports = router;