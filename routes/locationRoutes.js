const express = require("express");
const locationController = require("../controllers/locationController");
const router = express.Router();

// RÉCUPRATION DE LA POSITION EN TEMPS RÉEL
router.get("/location", locationController.getLocation);
// RÉCUPRATION DE LA POSITION EN TEMPS RÉEL
router.get("/location/:id", locationController.getLocationById);
// RÉCUPRATION DE LA POSITION EN TEMPS RÉEL
router.get("/location/:id/:latitude/:longitude", locationController.updateLocation);
// RÉCUPRATION DE LA POSITION EN TEMPS RÉEL

module.exports = router;
