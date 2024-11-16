const { Car, CarMake } = require("../models");
const { appendErrorLog } = require("../utils/logging");

const create = async (req, res) => {
  try {
    const host = req.get("host");
    const image = req.file;
    const {
      makeId,
      name,
      price,
      model,
      year,
      seats,
      transmission,
      licensePlate,
      isDriver,
    } = req.body;

    if (!makeId) {
      return res
        .status(400)
        .json({ error: "ID de la marque est obligatoire." });
    }

    if (!name) {
      return res
        .status(400)
        .json({ error: "Le nom de la véhicule est obligatoire." });
    }

    if (!price) {
      return res
        .status(400)
        .json({ error: "Le montant de la voiture est obligatoire." });
    }

    if (!model) {
      return res
        .status(400)
        .json({ error: "Le modele de la voiture est obligatoire." });
    }

    if (!year) {
      return res
        .status(400)
        .json({ error: "L'annee de la voiture est obligatoire." });
    }

    if (!seats) {
      return res
        .status(400)
        .json({ error: "Le nombre de places de la voiture est obligatoire." });
    }

    if (!transmission) {
      return res
        .status(400)
        .json({ error: "La transmission de la voiture est obligatoire." });
    }

    if (!licensePlate) {
      return res
        .status(400)
        .json({
          error: "La plaque d'immatriculation de la voiture est obligatoire.",
        });
    }

    if (!isDriver) {
      return res
        .status(400)
        .json({
          error:
            "Veuillez choisir si la voiture est avec chauffeur ou sans chauffeur.",
        });
    }

    const carMake = await CarMake.findOne({ where: { id: makeId } });
    if (!carMake) {
      return res
        .status(400)
        .json({ error: "La marque de voiture n'existe pas." });
    }

    const existingCar = await Car.findOne({ where: { name } });
    if (existingCar) {
      return res.status(400).json({ error: "La voiture existe deja." });
    }

    const imagePath = `cars/${image.filename}`;
    const imageUrl = `${req.protocol}://${host}/${imagePath}`;

    await Car.create({
      makeId,
      name,
      image: imageUrl,
      price,
      model,
      seats,
      transmission,
      year,
      licensePlate,
      isDriver,
    });

    return res.status(201).json({ message: "Voiture cree avec success." });
  } catch (error) {
    console.error(`ERROR CREATE CAR: ${error}`);
    appendErrorLog(`ERROR CREATE CAR: ${error}`);
    return res
      .status(500)
      .json({
        error: "Une erreur s'est produite lors de la creation de la voiture.",
      });
  }
};

module.exports = { create };
