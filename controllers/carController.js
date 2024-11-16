const { Car, CarMake, Rating } = require("../models");
const sequelize = require("sequelize");
const { appendErrorLog } = require("../utils/logging");

const create = async (req, res) => {
  try {
    const host = req.get("host");
    const image = req.file;
    const {
      makeId,
      name,
      priceNormal,
      priceDriver,
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

    if (!priceNormal) {
      return res
        .status(400)
        .json({ error: "Le montant de la voiture sans chauffeurest obligatoire." });
    }

    if (!priceDriver) {
      return res
        .status(400)
        .json({ error: "Le montant de la voiture avec chauffeur est obligatoire." });
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
      priceWithoutDriver: priceNormal,
      priceWithDriver: priceDriver,
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

const listWithDriver = async (req, res) => {
  try {
   const cars = await Car.findAll({
    where: { isDriver: true },
    attributes: {
      exclude: ["createdAt", "updatedAt", "priceWithoutDriver"],
      include: [
        [
          sequelize.literal(
            `(SELECT COALESCE(AVG(rating), 5) 
              FROM "Ratings" 
              WHERE "Ratings"."carId" = "Car"."id")`
          ),
          "averageRating",
        ],
      ],
    },
    include: {
      model: CarMake,
      attributes: ["name"],
    },
  });

  // Formatter la réponse
  const responseFormat = cars.map((car) => ({
    id: car.id,
    model: car.CarMake.name,
    name: car.name,
    image: car.image,
    price: car.priceWithDriver,
    model: car.model,
    year: car.year,
    seats: car.seats,
    transmission: car.transmission,
    licensePlate: car.licensePlate,
    averageRating: parseFloat(car.getDataValue("averageRating")),
  }));

   return res.status(200).json({
     status: "success",
     data: responseFormat,
   });
  } catch (error) {
    console.error(`ERROR LIST CAR WITH DRIVER: ${error}`);
    appendErrorLog(`ERROR LIST CAR WITH DRIVER: ${error}`);
    return res
      .status(500)
      .json({
        error: "Une erreur s'est produite lors de la creation de la voiture.",
      });
  }
};

const listWithoutDriver = async (req, res) => {
  try {

   const cars = await Car.findAll({
    where: { isDriver: true },
    attributes: {
      exclude: ["createdAt", "updatedAt", "priceWithDriver"],
      include: [
        // Calculer la moyenne des notations avec une sous-requête
        [
          sequelize.literal(
            `(SELECT COALESCE(AVG(rating), 5) 
              FROM "Ratings" 
              WHERE "Ratings"."carId" = "Car"."id")`
          ),
          "averageRating",
        ],
      ],
    },
    include: {
      model: CarMake,
      attributes: ["name"],
    },
  });

  // Formatter la réponse
  const responseFormat = cars.map((car) => ({
    id: car.id,
    model: car.CarMake.name,
    name: car.name,
    image: car.image,
    price: car.priceWithoutDriver,
    model: car.model,
    year: car.year,
    seats: car.seats,
    transmission: car.transmission,
    licensePlate: car.licensePlate,
    averageRating: parseFloat(car.getDataValue("averageRating")),
  }));

   return res.status(200).json({
     status: "success",
     data: responseFormat,
   });
    
  } catch (error) {
    console.error(`ERROR LIST CAR WITH DRIVER: ${error}`);
    appendErrorLog(`ERROR LIST CAR WITH DRIVER: ${error}`);
    return res
      .status(500)
      .json({
        error: "Une erreur s'est produite lors de la creation de la voiture.",
      });
  }
};

module.exports = { create,listWithDriver, listWithoutDriver };
