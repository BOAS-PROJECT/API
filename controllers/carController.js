const { Car, CarMake, CarImage, Rating, User, PaymentMethod, Reservation, Notification } = require("../models");
const sequelize = require("sequelize");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const { appendErrorLog } = require("../utils/logging");


const location = async (req, res) => {
  try {
    
  } catch (error) {
    console.error(`ERROR GET LOCATION: ${error}`);
    appendErrorLog(`ERROR GET LOCATION: ${error}`);
    return res.status(500).json({
      error: "Une erreur s'est produite lors de la recherche de la localisation.",
    });
  }
}
const create = async (req, res) => {
  try {
    const host = req.get("host");
    const image = req.file;
    const {
      cityId,
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
      descriptionWithDriver,
      descriptionWithoutDriver,
      fuel,
      caution,
    } = req.body;

    if (!cityId) {
      return res
        .status(400)
        .json({ error: "ID de la ville est obligatoire." });
    }

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

    if (!fuel) {
      return res
        .status(400)
        .json({ error: "Le type de carburant de la voiture est obligatoire." });
    }

    if (!isDriver) {
      return res
        .status(400)
        .json({
          error:
            "Veuillez choisir si la voiture est avec chauffeur ou sans chauffeur.",
        });
    }

    if (!caution) {
      return res
        .status(400)
        .json({ error: "La caution de la voiture est obligatoire." });
    }

    // Que descriptionWithDriver ou descriptionWithoutDriver soit renseigné
    if (!descriptionWithDriver && !descriptionWithoutDriver) {
      return res
        .status(400)
        .json({ error: "La description de la voiture est obligatoire." });
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
      cityId,
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
      fuel,
      caution,
      descriptionWithDriver,
      descriptionWithoutDriver
    });

    return res.status(201).json({ 
      status: "success",
      message : "Le véhicule a été cree avec succes."
    });
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
    const cityid = req.headers.cityid;
    if (!cityid) {
      return res.status(400).json({
        status: "error",
        message: "ID de la ville est obligatoire.",
      });
    }

    const cars = await Car.findAll({
      where: { isDriver: true, cityId: cityid },
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
      include: [
        {
          model: CarMake,
          attributes: ["name"],
        },
        {
          model: CarImage,
          attributes: ["image"],
          as: "images",
        },
      ],
      order: [["name", "DESC"]],
    });

    // Vérification si cars est un tableau avant d'appliquer map()
    if (!Array.isArray(cars)) {
      return res.status(500).json({
        status: "error",
        message: "Erreur lors de la récupération des voitures.",
      });
    }

    // Formatter la réponse
    const responseFormat = cars.map((car) => ({
      id: car.id,
      model: car.CarMake?.name || "Inconnu",
      name: car.name,
      images: car.images?.map((image) => image.image) || [],
      price: car.priceWithDriver,
      year: car.year,
      seats: car.seats,
      transmission: car.transmission,
      licensePlate: car.licensePlate,
      fuel: car.fuel,
      caution: car.caution,
      cautionFuelwithDriver: car.priceFuelwithDriver,
      cautionFuelWithoutDriver: car.priceFuelWithoutDriver,
      descriptionWithoutDriver: car.descriptionWithoutDriver,
      descriptionWithDriver: car.descriptionWithDriver,
      averageRating: parseFloat(car.getDataValue("averageRating")) || 5,
    }));

    return res.status(200).json({
      status: "success",
      data: responseFormat,
    });
  } catch (error) {
    console.error(`ERROR LIST CAR WITH DRIVER: ${error}`);
    appendErrorLog(`ERROR LIST CAR WITH DRIVER: ${error}`);
    return res.status(500).json({
      error: "Une erreur s'est produite lors de la récupération des voitures.",
    });
  }
};

const listWithoutDriver = async (req, res) => {
  try {
    const cityid = req.headers.cityid;
    if (!cityid) {
      return res.status(400).json({
        status: "error",
        message: "ID de la ville est obligatoire.",
      });
    }

    const cars = await Car.findAll({
      where: { isDriver: false, cityId: cityid },
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
      include: [
        {
          model: CarMake,
          attributes: ["name"],
        },
        {
          model: CarImage,
          attributes: ["image"],
          as: "images",
        },
      ],
      order: [["name", "DESC"]],
    });

    // Vérification si cars est un tableau avant d'appliquer map()
    if (!Array.isArray(cars)) {
      return res.status(500).json({
        status: "error",
        message: "Erreur lors de la récupération des voitures.",
      });
    }

    // Formatter la réponse
    const responseFormat = cars.map((car) => ({
      id: car.id,
      model: car.CarMake?.name || "Inconnu",
      name: car.name,
      images: car.images?.map((image) => image.image) || [],
      price: car.priceWithDriver,
      year: car.year,
      seats: car.seats,
      transmission: car.transmission,
      licensePlate: car.licensePlate,
      fuel: car.fuel,
      caution: car.caution,
      cautionFuelwithDriver: car.priceFuelwithDriver,
      cautionFuelWithoutDriver: car.priceFuelWithoutDriver,
      descriptionWithoutDriver: car.descriptionWithoutDriver,
      descriptionWithDriver: car.descriptionWithDriver,
      averageRating: parseFloat(car.getDataValue("averageRating")) || 5,
    }));

    return res.status(200).json({
      status: "success",
      data: responseFormat,
    });
  } catch (error) {
    console.error(`ERROR LIST CAR WITH DRIVER: ${error}`);
    appendErrorLog(`ERROR LIST CAR WITH DRIVER: ${error}`);
    return res.status(500).json({
      error: "Une erreur s'est produite lors de la récupération des voitures.",
    });
  }
};

const reservation = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const { carId, payment, days, date, amount, type } = req.body;
    const host = req.get("host");
    const image = req.file;

    if (!days) {
      return res
        .status(400)
        .json({ status: "error", message: "Le nombre de jours est obligatoire." });
    }
    if (!date) {
      return res
        .status(400)
        .json({ status: "error", message: "La date est obligatoire." });
    }
    if (!amount) {
      return res
        .status(400)
        .json({ status: "error", message: "Le montant est obligatoire." });
    }
    if (!image) {
      return res
        .status(400)
        .json({ status: "error", message: "Une piece jointe est obligatoire." });
    }
    if (!payment) {
      return res
        .status(400)
        .json({ status: "error", message: "Le paiement est obligatoire." });
    }
    if (!carId) {
      return res
        .json({ status: "error", message: "ID de la voiture est obligatoire." });
    }

    // Vérifie si l'en-tête commence par "Bearer "
    if (!token.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Format de token invalide.",
      });
    }

    // Extrait le token en supprimant le préfixe "Bearer "
    const customToken = token.substring(7);
    let decodedToken;

    try {
      decodedToken = jwt.verify(customToken, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ status: "error", message: "TokenExpiredError" });
      }
      return res
        .status(401)
        .json({ status: "error", message: `Token 401. ${error}` });
    }

    if (!decodedToken) {
      return res
        .status(401)
        .json({ status: "error", message: "Token decode non fourni." });
    }

    const customerId = decodedToken.id;
    const customer = await User.findByPk(customerId);
    if (!customer) {
        return res.status(400).json({ status: "error", message: "Le client n'existe pas." });
    }

    const car = await Car.findByPk(carId);
    if (!car) {
      return res.status(400).json({ status: "error", message: "La voiture n'existe pas." });
    }

    const paymentMethod = await PaymentMethod.findByPk(payment);
    if (!paymentMethod) {
      return res
        .status(400)
        .json({ status: "error", message: "Le moyen de paiement n'existe pas." });
    }

    const imagePath = `attachments/${image.filename}`;
    const imageUrl = `${req.protocol}://${host}/${imagePath}`;

    if (customer.token) {
      const message = {
        notification: { title: "Félicitations 🎉", body: `Votre réservation de véhicule a été prise en compte avec succès. Rendez-vous à l'agence pour finaliser le paiement et récupérer votre véhicule. Merci de votre confiance !` },
        token: customer.token,
      };
      try {
        await admin.messaging().send(message);
      } catch (error) {
        console.error("Échec de l'envoi de la notification de succès:", error);
      }
    }

   const myreservation =  await Reservation.create({
      userId: customer.id,
      carId: carId,
      paymentMethodId: payment,
      days,
      date,
      amount,
      status: 1,
      type: 0,
      attachment: imageUrl,
    });

    await Notification.create({
      userId: customer.id,
      reservationId: myreservation.id,
      message: `Votre réservation de véhicule a été prise en compte avec succès. Rendez-vous à l'agence pour finaliser le paiement et récupérer votre véhicule. Merci de votre confiance !`,
    });

    return res.status(201).json({
      status: "success",
      message: "Votre réservation à été prise en charge avec succès, veuillez vous rendre dans votre historique pour pouvoir modifier-annuler-changer le mode paiement.",
    });
  } catch (error) {
    console.error(`ERROR RESERVATION CARMOVING: ${error}`);
    appendErrorLog(`ERROR RESERVATION CARMOVING: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la creation du compte.",
    });
  }
};

module.exports = { create,listWithDriver, listWithoutDriver, reservation };
