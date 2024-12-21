const express = require("express");
const carController = require("../controllers/carController");
const upload = require("../utils/carMulterConfig");
const fileUpload = require("../utils/attachementConfig");
const router = express.Router();

// CREATION DU VÉHICULE
router.post("/create",  upload.single("image"), carController.create);

router.get("/list-with-driver", carController.listWithDriver);

router.get("/list-without-driver", carController.listWithoutDriver);

router.post("/reservation", fileUpload.single("image") , carController.reservation);

module.exports = router;