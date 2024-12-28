const { Tourism, City, TourismImage, Reservation } = require("../models");
const jwt = require("jsonwebtoken");
const { appendErrorLog } = require("../utils/logging");

const create = async (req, res) => {
  try {
    const host = req.get("host");
    const image = req.file;
    const { city, title, description } = req.body;

    if (!city) {
      return res.status(400).json({
        status: "error",
        message: "La ville est obligatoire.",
      });
    }

    if (!title) {
      return res.status(400).json({
        status: "error",
        message: "Le titre est obligatoire.",
      });
    }

    if (!description) {
      return res.status(400).json({
        status: "error",
        message: "La description est obligatoire.",
      });
    }

    if (!image) {
      return res.status(400).json({
        status: "error",
        message: "L'image est obligatoire.",
      });
    }

    const existingCity = await City.findOne({ where: { id: city } });
    if (!existingCity) {
      return res.status(400).json({
        status: "error",
        message: "La ville n'existe pas.",
      });
    }

    const existingTourism = await Tourism.findOne({ where: { title } });
    if (existingTourism) {
      return res.status(400).json({
        status: "error",
        message: "Un tourisme avec ce titre existe deja.",
      });
    }

    const imagePath = `tourisms/${image.filename}`;
    const imageUrl = `${req.protocol}://${host}/${imagePath}`;

    await Tourism.create({
      cityId: city,
      title,
      descriptions: description,
      image: imageUrl,
    });

    return res.status(201).json({
      status: "success",
      message: "Le tourisme a ete cree avec succes.",
    });
  } catch (error) {
    console.error(`ERROR CREATE TOURISM: ${error}`);
    appendErrorLog(`ERROR CREATE TOURISM: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la creation du tourisme.",
    });
  }
};

const list = async (req, res) => {
    try {
        const images = await Tourism.findAll({
            exclude: ["createdAt", "updatedAt"],
            include: [
                {
                    model: TourismImage,
                    attributes: ["image"],
                },
                {
                    model: City,
                    attributes: ["name"],
                },
            ]
        });

        const responseFormat = images.map((tourism) => ({
            id: tourism.id,
            title: tourism.title,
            description: tourism.descriptions,
            image: tourism.image,
            city: tourism.City.name,
            images: tourism.TourismImages.map((image) => {
                return {
                    image: image.image,
                };
            }),
        }));
        
        return res.status(200).json({
            status: "success",
            data: responseFormat,
        });
        
    } catch (error) {
        console.error(`ERROR LIST IMAGES: ${error}`);
        appendErrorLog(`ERROR LIST IMAGES: ${error}`);
        return res.status(500).json({
            status: "error",
            message: "Une erreur s'est produite lors de la creation du tourisme.",
        });
    }
}

const reservation = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const { tourismId, date } = req.body;

    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
    }

    if (!date) {
      return res
        .status(400)
        .json({ status: "error", message: "La date est obligatoire." });
    }

    if (!tourismId) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "ID du site touristique est obligatoire.",
        });
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

    const property = await Tourism.findByPk(tourismId);
    if (!property) {
      return res
        .status(400)
        .json({ status: "error", message: "Le logement n'existe pas." });
    }

    await Reservation.create({
      userId: customer.id,
      tourismId: tourismId,
      paymentMethodId: 1,
      date,
      status: 1,
    });

    if (customer.token) {
      const userToken = customer.token;
      const message = {
        token: userToken,
        notification: {
          title: "Félicitations!",
          body: `Votre reservation du site touristique a bien ete prise en compte.`,
        },
      };
      await admin.messaging().send(message);
    }

    return res.status(201).json({
      status: "success",
      message:
        "La réservation du site touristique à bien été prise en compte avec succès. Vous serez contacté par l'agence BOAS Service pour confirmer votre reservation. Merci de votre confiance !",
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

module.exports ={ create, list, reservation };
