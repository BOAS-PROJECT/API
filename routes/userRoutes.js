const express = require("express");
const userController = require("../controllers/userController");
const upload = require("../utils/customerMulterConfig");
const router = express.Router();

// CREATION DU COMPTE
router.post("/register", upload.single("photo"), userController.create);

// CONNEXION
router.post("/login", userController.login);

// PHOTO DE PROFIL
router.put("/photo", upload.single("photo"), userController.photo);

// TOKEN
router.put("/update-token", userController.updateToken);

module.exports = router;
