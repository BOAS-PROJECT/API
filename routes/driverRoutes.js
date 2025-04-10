const express = require("express");
const driverController = require("../controllers/driverController");
const upload = require("../utils/driverMulterConfig");
const router = express.Router();

// CREATION DU COMPTE
router.post("/register", upload.single("photo"), driverController.create);

// CONNEXION
router.post("/login", driverController.login);

// DISPONIBILITE DU CONDUCTEUR
router.put("/availability", driverController.updateAvailability);

// VALIDATION DU COMPTE
router.put("/validate-account", driverController.validateAccount);

// LISTE DES CONDUCTEURS ACTIFS
router.get("/list-active-drivers", driverController.listActiveDrivers);

// LISTE DES CONDUCTEURS INACTIFS
router.get("/list-inactive-drivers", driverController.listInActiveDrivers);

// MISE A JOUR DU TOKEN
router.put("/update-token", driverController.updateToken);

// MISE A JOUR DU MOT DE PASSE
router.put("/update-password", driverController.updatePassword);

// UPLOAD DE LA PHOTO
router.put("/upload-photo", upload.single("photo"), driverController.uploadPhoto);

// CREATE PASSWORD
router.put("/create-password", driverController.createPassword);

// CHECK VALIDITY
router.post("/check-validity", driverController.checkValidity);

module.exports = router;