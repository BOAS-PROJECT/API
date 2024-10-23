const express = require("express");
const userController = require("../controllers/userController");
const upload = require("../utils/customerMulterConfig");
const router = express.Router();

// CREATION DU COMPTE
router.post("/register", upload.single("photo"), userController.create);

// CONNEXION
router.post("/login", userController.login);

module.exports = router;
