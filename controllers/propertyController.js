const { Property, PropertyType, PropertyImage, City, OwnerProperty, User, Car, PaymentMethod, Reservation } = require("../models");
const { appendErrorLog } = require("../utils/logging");

const createtype = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Le nom de la propriete est obligatoire.",
      });
    }

    const existingType = await PropertyType.findOne({ where: { name } });
    if (existingType) {
      return res.status(400).json({
        status: "error",
        message: "Une propriete avec ce nom existe deja.",
      });
    }

    await PropertyType.create({ name, description });
    return res.status(201).json({
      status: "success",
      message: "La propriete a ete cree avec succes.",
    });
  } catch (error) {
    console.error(`ERROR CREATE PROPERTY: ${error}`);
    appendErrorLog(`ERROR CREATE PROPERTY: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la creation de la propriete.",
    });
  }
};

const create = async (req, res) => {
  try {
    const host = req.get("host");
    const image = req.file;
    const { type, city, owner, title, description, price, surface } = req.body;
    if (!type) {
      return res.status(400).json({
        status: "error",
        message: "Le type de bien est obligatoire.",
      });
    }

    if (!owner) {
        return res.status(400).json({
          status: "error",
          message: "Le proprietaire du bien est obligatoire.",
        });
    }

    const existingOwner = await OwnerProperty.findOne({ where: { id: owner } });
    if (!existingOwner) {
      return res.status(400).json({
        status: "error",
        message: "Le proprietaire du bien n'existe pas.",
      });
    }

    const existingType = await PropertyType.findOne({ where: { id: type } });
    if (!existingType) {
      return res.status(400).json({
        status: "error",
        message: "Le type de bien n'existe pas.",
      });
    }

    if (!city) {
      return res.status(400).json({
        status: "error",
        message: "La ville est obligatoire.",
      });
    }

    const existingCity = await City.findOne({ where: { id: city } });
    if (!existingCity) {
      return res.status(400).json({
        status: "error",
        message: "La ville n'existe pas.",
      });
    }

    if (!title) {
      return res.status(400).json({
        status: "error",
        message: "Le titre du bien est obligatoire.",
      });
    }

    if (!description) {
      return res.status(400).json({
        status: "error",
        message: "La description du bien est obligatoire.",
      });
    }

    if (!price) {
      return res.status(400).json({
        status: "error",
        message: "Le prix du bien est obligatoire.",
      });
    }

    if (!surface) {
      return res.status(400).json({
        status: "error",
        message: "La surface du bien est obligatoire.",
      });
    }

    const imagePath = `properties/${image.filename}`;
    const imageUrl = `${req.protocol}://${host}/${imagePath}`;

    const existingProperty = await Property.findOne({ where: { title, cityId: city, typeId: type } });
    if (existingProperty) {
      return res.status(400).json({
        status: "error",
        message: "Une propriete avec ce titre et cette ville existe deja.",
      });
    }

    await Property.create({
      typeId: type,
      cityId: city,
      ownerId: owner,
      title,
      description,
      price,
      surface,
      image: imageUrl,
    });

    return res.status(201).json({
      status: "success",
      message: "La propriété a ete cree avec succes.",
    });
  } catch (error) {
    console.error(`ERROR CREATE PROPERTY: ${error}`);
    appendErrorLog(`ERROR CREATE PROPERTY: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la creation de la propriete.",
    });
  }
};

const createOwner = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Le nom est obligatoire.",
      });
    }

    if (!phone) {
      return res.status(400).json({
        status: "error",
        message: "Le numéro de téléphone est obligatoire.",
      });
    }

    if (!address) {
      return res.status(400).json({
        status: "error",
        message: "L'adresse est obligatoire.",
      });
    }

    const existingOwner = await OwnerProperty.findOne({ where: { name, phone } });
    if (existingOwner) {
      return res.status(400).json({
        status: "error",
        message: "Un proprietaire avec ce nom et numéro de téléphone existe deja.",
      });
    }

    await OwnerProperty.create({ name, phone, email, address });
    return res.status(201).json({
      status: "success",
      message: "Le proprietaire a ete cree avec succes.",
    });
  } catch (error) {
    console.error(`ERROR CREATE OwnerProperty: ${error}`);
    appendErrorLog(`ERROR CREATE OwnerProperty: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la creation du compte.",
    });
  }
};

const list = async (req, res) => {
  try {
    const properties = await Property.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      order: [["id", "DESC"]],
      include: [
        { model: PropertyType, attributes: ["name"] },
        { model: City, attributes: ["name"] },
      ],
    });

    const formatedProperties = properties.map((property) => ({
      id: property.id,
      type: property.PropertyType.name,
      city: property.City.name,
      title: property.title,
      description: property.description,
      price: property.price,
      surface: property.surface,
      image: property.image,
    }));
    return res.status(200).json({
      status: "success",
      data: formatedProperties,
    });
  } catch (error) {
    console.error(`ERROR LIST PHARMACIES: ${error}`);
    appendErrorLog(`ERROR LIST PHARMACIES: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la creation de la pharmacie.",
    });
  }
};

const reservation = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const { carId, propertyId, payment, days, date, amount, description } = req.body;

    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
    }
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

    if (!payment) {
      return res
        .status(400)
        .json({ status: "error", message: "Le paiement est obligatoire." });
    }
    if (!carId) {
      return res
        .json({ status: "error", message: "ID de la voiture est obligatoire." });
    }

    if (!propertyId) {
      return res
        .status(400)
        .json({ status: "error", message: "ID de la propriete est obligatoire." });
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
        return res.status(400).json({ status: "error", message: "Le client n'existe pas." });
    }

    const car = await Car.findByPk(carId);
    if (!car) {
      return res.status(400).json({ status: "error", message: "La voiture n'existe pas." });
    }

    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(400).json({ status: "error", message: "Le logement n'existe pas." });
    }

    const paymentMethod = await PaymentMethod.findByPk(payment);
    if (!paymentMethod) {
      return res
        .status(400)
        .json({ status: "error", message: "Le moyen de paiement n'existe pas." });
    }


    await Reservation.create({
      userId: customer.id,
      carId: carId,
      propertyId: propertyId,
      paymentMethodId: payment,
      days,
      date,
      amount,
      status: 1,
      description
    });

    return res.status(201).json({
      status: "success",
      message: "Votre réservation de véhicule vers votre logement a bien été prise en compte avec succès. Rendez-vous à l'agence pour finaliser le paiement et récupérer votre véhicule. Merci de votre confiance !",
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


module.exports = {
  createtype,
  create,
  createOwner,
  list,
  reservation
};
