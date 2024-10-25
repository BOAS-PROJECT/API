const express = require("express");
const driverController = require("../controllers/driverController");
const router = express.Router();

// CREATION DU COMPTE
router.post("/register", driverController.create);

// CONNEXION
router.post("/login", driverController.login);

// VALIDATION DU COMPTE
router.put("/validate-account", driverController.validateAccount);

// LISTE DES CONDUCTEURS ACTIFS
router.get("/list-active-drivers", driverController.listActiveDrivers);

module.exports = router;