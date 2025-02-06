const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  Car,
  CarMoving,
  CarMake,
  Reservation,
  User,
  PaymentMethod,
} = require("../models");
const { appendErrorLog } = require("../utils/logging");

const create = async (req, res) => {
  try {
    const host = req.get("host");
    const image = req.file;
    const {
      cityId,
      makeId,
      name,
      volume,
      tonage,
      price,
      priceHandling,
      licensePlate,
      description,
    } = req.body;

    if (!cityId) {
      return res
        .status(400)
        .json({ status: "error", message: "ID de la ville est obligatoire." });
    }

    if (!makeId) {
      return res
        .status(400)
        .json({ status: "error", message: "ID de la marque est obligatoire." });
    }

    if (!name) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Le nom de la voiture est obligatoire.",
        });
    }

    if (!volume) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Le volume de la voiture est obligatoire.",
        });
    }

    if (!tonage) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Le tonnage de la voiture est obligatoire.",
        });
    }

    if (!price) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Le prix de la voiture est obligatoire.",
        });
    }

    if (!licensePlate) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Le plaque d'immatriculation de la voiture est obligatoire.",
        });
    }

    if (!priceHandling) {
      return res.status(400).json({
        status: "error",
        message: "Le prix de la voiture est obligatoire.",
      });
    }

    if (!description) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "La description de la voiture est obligatoire.",
        });
    }

    const carMake = await CarMake.findByPk(makeId);
    if (!carMake) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "La marque de la voiture n'existe pas.",
        });
    }

    const existingCar = await CarMoving.findOne({ where: { name } });
    if (existingCar) {
      return res
        .status(400)
        .json({ status: "error", message: "La voiture existe deja." });
    }

    const imagePath = `cars/${image.filename}`;
    const imageUrl = `${req.protocol}://${host}/${imagePath}`;

    await CarMoving.create({
      cityId,
      makeId,
      name,
      image: imageUrl,
      volume,
      tonage,
      price,
      priceHandling,
      licensePlate,
      description,
    });

    return res.status(201).json({
      status: "success",
      message: "Le véhicule a bien ete cree avec succes.",
    });
  } catch (error) {
    console.error(`ERROR CREATE CARMOVING: ${error}`);
    appendErrorLog(`ERROR CREATE CARMOVING: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la creation du compte.",
    });
  }
};

const list = async (req, res) => {
  try {
    const cityid = req.headers.cityid;
    if (!cityid) {
      return res.status(400).json({ status: "error" ,message: "ID de la ville est obligatoire." });
    }

    const cars = await CarMoving.findAll({
      where: { cityId: cityid },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: {
        model: CarMake,
        attributes: ["name"],
      },
    });

    const responseFormat = cars.map((car) => ({
      id: car.id,
      model: car.CarMake.name,
      name: car.name,
      image: car.image,
      volume: car.volume,
      tonage: car.tonage,
      price: car.price,
      priceHandling: car.priceHandling,
      licensePlate: car.licensePlate,
      description: car.description,
      type: car.type,
    }));

    return res.status(200).json({
      status: "success",
      data: responseFormat,
    });
  } catch (error) {
    console.error(`ERROR LIST CARMOVING: ${error}`);
    appendErrorLog(`ERROR LIST CARMOVING: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la creation du compte.",
    });
  }
};

const reservation = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const { carId, days, date, amount, description } = req.body;

    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
    }
    if (!days) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Le nombre de jours est obligatoire.",
        });
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
    if (!carId) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "L'ID de la véhicule est obligatoire.",
        });
    }

    if (!description) {
      return res
        .status(400)
        .json({ status: "error", message: "La description est obligatoire." });
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
        .json({ status: "error", message: "Token invalide." });
    }

    if (!decodedToken) {
      return res
        .status(401)
        .json({ status: "error", message: "Token invalide." });
    }

    const customerId = decodedToken.id;
    const customer = await User.findByPk(customerId);
    if (!customer) {
      return res
        .status(400)
        .json({ status: "error", message: "Le client n'existe pas." });
    }

    const car = await CarMoving.findByPk(carId);
    if (!car) {
      return res
        .status(400)
        .json({ status: "error", message: "Le véhicule n'existe pas." });
    }

    await Reservation.create({
      userId: customer.id,
      carMovingId: carId,
      paymentMethodId: 1,
      days,
      date,
      amount,
      status: 1,
      description,
    });

    if (customer.token) {
      const userToken = customer.token;
      const message = {
        token: userToken,
        notification: {
          title: "Félicitations!",
          body: `Votre réservation de véhicule de déménagement a été prise en compte avec succès. Vous serrez contacté sous peu, merci.`,
        },
      };

      try {
        await admin.messaging().send(message);
        console.log(`Notification envoyée à l'utilisateur avec le token : ${userToken}`);
      } catch (error) {
        console.error(`Erreur lors de l'envoi de la notification : ${error.message}`);
      }
    }

    return res.status(201).json({
      status: "success",
      message:"Votre réservation à été prise en charge avec succès, veuillez vous rendre dans votre historique pour pouvoir modifier-annuler-changer le mode paiement, suivi évolution du déménagement.",
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

module.exports = { create, list, reservation };
