const express = require("express");
const driverController = require("../controllers/driverController");
const upload = require("../utils/driverMulterConfig");
const router = express.Router();

// CREATION DU COMPTE
router.post("/register", driverController.create);

// CONNEXION
router.post("/login", driverController.login);

// VALIDATION DU COMPTE
router.put("/validate-account", driverController.validateAccount);

// LISTE DES CONDUCTEURS ACTIFS
router.get("/list-active-drivers", driverController.listActiveDrivers);

// LISTE DES CONDUCTEURS INACTIFS
router.get("/list-inactive-drivers", driverController.listInActiveDrivers);

// MISE A JOUR DU TOKEN
router.put("/update-token", driverController.updateToken);

// UPLOAD DE LA PHOTO
router.put("/upload-photo", upload.single("photo"), driverController.uploadPhoto);

module.exports = router;