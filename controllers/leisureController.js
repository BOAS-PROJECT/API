const { Leisure, LeisureImage, Reservation, User } = require("../models");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const { appendErrorLog } = require("../utils/logging");

const list = async (req, res) => {
    const cityId = req.headers.cityid;
    try {
        const leisure = await Leisure.findAll({
            include: [
                {
                    model: LeisureImage,
                    attributes: ["image"],
                },
            ],
            order: [["createdAt", "DESC"]],
            where: { cityId: cityId },
        });

       const responseFormat = leisure.map((leisure) => ({
            id: leisure.id,
            title: leisure.title,
            description: leisure.description,
            address: leisure.address,
            image: leisure.image,
            images: leisure.LeisureImages.map((image) => {
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
        console.error(`ERROR LIST PHARMACIES: ${error}`);
        appendErrorLog(`ERROR LIST PHARMACIES: ${error}`);
        return res.status(500).json({
            status: "error",
            message: "Une erreur s'est produite lors de la creation de la pharmacie.",
        });
    }
}

const reservation = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const { leisureId, date } = req.body;

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

    if (!leisureId) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "ID du loisir est obligatoire.",
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

    const leisure = await Leisure.findByPk(leisureId);
    if (!leisure) {
      return res
        .status(400)
        .json({ status: "error", message: "Le loisir n'existe pas." });
    }

    await Reservation.create({
      userId: customer.id,
      leisureId: leisureId,
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
          body: `Votre réservation de ${leisure.title} a bien été prise en compte.`,
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
      message:
        `La réservation de ${leisure.title} à bien été prise en compte avec succès. Vous serez contacté par l'agence BOAS Service pour confirmer votre reservation. Merci de votre confiance !`,
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
    list,
    reservation,
};