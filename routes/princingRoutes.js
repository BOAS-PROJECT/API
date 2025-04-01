const express = require("express");
const pricingController = require("../controllers/princingController");
const router = express.Router();

// CREATION DU PRICING
router.post("/create", pricingController.create);
// LISTE DES PRICINGS
router.get("/list", pricingController.getAll);
// CALCUL DU PRICING
router.post("/calculate", pricingController.calculate);

module.exports = router;