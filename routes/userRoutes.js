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

// MISE À JOURS DU MOT DE PASSE
router.put("/update-password", userController.updatePassword);

// LISTE DES RESERVATIONS
router.get("/reservation-list", userController.reservationlist);

// ANNULATION D'UN RESERVATION
router.post("/cancel-reservation", userController.cancelReservation);

// SUPPRESSION D'UN RESERVATION
router.post("/delete-reservation", userController.deleteReservation);

// NOTIFICATION
router.post("/notification", userController.notification);

// RESERVATION D'UN VÉHICULE
router.post("/book-car", userController.reservationCar);

module.exports = router;
