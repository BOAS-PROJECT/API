const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

// CREATION DU COMPTE
router.post("/register", userController.create);

// CONNEXION
router.post("/login", userController.login);

module.exports = router;
