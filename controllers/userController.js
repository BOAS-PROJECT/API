const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sharp = require("sharp");
const path = require("path");
const admin = require("firebase-admin");
const multer = require("multer");
const {
  User,
  Reservation,
  Car,
  Driver,
  Pharmacy,
  Tourism,
  Leisure,
  CarMoving,
  Property,
  PaymentMethod,
} = require("../models");
const { appendErrorLog } = require("../utils/logging");
const { token } = require("morgan");

const create = async (req, res) => {
  try {
    const host = req.get("host");
    const photo = req.file; // Peut être undefined si aucune photo n'est envoyée
    const { firstname, lastname, genre, city, email, phone, password } =
      req.body;

    // Normalisation de l'email (convertit les chaînes vides en null)
    const processedEmail = email ? email.trim() : null;

    // Vérifications des champs obligatoires
    if (!firstname) {
      return res.status(400).json({
        status: "error",
        message: "Le nom d'utilisateur est obligatoire.",
      });
    }

    if (!lastname) {
      return res.status(400).json({
        status: "error",
        message: "Le prenom d'utilisateur est obligatoire.",
      });
    }

    if (!genre) {
      return res.status(400).json({
        status: "error",
        message: "Le genre est obligatoire.",
      });
    }

    if (!city) {
      return res.status(400).json({
        status: "error",
        message: "La ville est obligatoire.",
      });
    }

    if (!phone) {
      return res.status(400).json({
        status: "error",
        message: "Le numéro de téléphone est obligatoire.",
      });
    }

    if (!password) {
      return res.status(400).json({
        status: "error",
        message: "Le mot de passe est obligatoire.",
      });
    }

    // Vérifications des doublons sur le téléphone ou l'email
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message:
          "Un compte existe déjà pour ce numéro de téléphone, veuillez vous connecter ou choisir un autre numéro.",
      });
    }

    // Vérification doublon email SEULEMENT si email fourni
    if (processedEmail) {
      const existingEmail = await User.findOne({
        where: { email: processedEmail },
      });
      if (existingEmail) {
        return res.status(400).json({
          status: "error",
          message: "Un compte existe déjà pour cet email.",
        });
      }
    }

    // Gestion des images (si une photo est fournie)
    let imageUrl = null;
    let thumbnailUrl = null;

    if (photo) {
      const imagePath = `users/${photo.filename}`;
      imageUrl = `${req.protocol}://${host}/${imagePath}`;
      const thumbnailFilename = `thumb_${photo.filename}`;
      const thumbnailPath = `users/${thumbnailFilename}`;
      thumbnailUrl = `${req.protocol}://${host}/${thumbnailPath}`;

      // Créer le thumbnail avec sharp
      await sharp(photo.path)
        .resize(200, 200) // Taille du thumbnail
        .toFile(path.join(__dirname, `../public/${thumbnailPath}`));
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur dans la base de données
    const user = await User.create({
      firstname,
      lastname,
      genre,
      city,
      email,
      phone,
      photo: imageUrl, // Null si aucune photo
      thumbnail: thumbnailUrl, // Null si aucune photo
      password: hashedPassword,
    });

    // Génération du token JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: "isUser",
      },
      process.env.JWT_SECRET
    );

    // Construction de la réponse
    const response = {
      firstname: user.firstname,
      lastname: user.lastname,
      genre: user.genre,
      birthday: user.birthday,
      city: user.city,
      email: user.email,
      phone: user.phone,
      photo: user.photo,
      thumbnail: user.thumbnail,
      token,
    };

    return res.status(201).json({
      status: "success",
      data: response,
    });
  } catch (error) {
    console.error(`ERROR CREATE ACCOUNT USER: ${error}`);
    appendErrorLog(`ERROR CREATE ACCOUNT USER: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la creation du compte.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone) {
      return res.status(400).json({
        status: "error",
        message: "Le numéro de téléphone est obligatoire.",
      });
    }

    if (!password) {
      return res.status(400).json({
        status: "error",
        message: "Le mot de passe est obligatoire.",
      });
    }

    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(400).json({
        status: "error",
        message:
          "Le compte n'existe pas, veuillez vous inscrire s'il vous plais.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: "error",
        message:
          "Le mot de passe est incorrect. Veuillez réessayer s'il vous plais.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: "isUser",
      },
      process.env.JWT_SECRET
    );

    const response = {
      firstname: user.firstname,
      lastname: user.lastname,
      genre: user.genre,
      birthday: user.birthday,
      genre: user.genre,
      city: user.city,
      email: user.email,
      phone: user.phone,
      photo: user.photo,
      thumbnail: user.thumbnail,
      token,
    };

    return res.status(200).json({
      status: "success",
      data: response,
    });
  } catch (error) {
    console.error(`ERROR LOGIN USER: ${error}`);
    appendErrorLog(`ERROR LOGIN USER: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la connexion.",
    });
  }
};

const photo = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const host = req.get("host");
    const photo = req.file;
    // Récupérer le worker et vérifier s'il existe
    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
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

    const userId = decodedToken.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message:
          "Compte non trouvé. Veuillez réessayer ou en créer un nouveau.",
      });
    }

    if (!photo) {
      return res.status(400).json({
        status: "error",
        message: "La photo est requise.",
      });
    }

    // Générez et enregistrez l'image et le thumbnail
    const imagePath = `users/${photo.filename}`;
    const imageUrl = `${req.protocol}://${host}/${imagePath}`;
    const thumbnailFilename = `thumb_${photo.filename}`;
    const thumbnailPath = `users/${thumbnailFilename}`;
    const thumbnailUrl = `${req.protocol}://${host}/${thumbnailPath}`;

    // Créer le thumbnail avec sharp
    await sharp(photo.path)
      .resize(200, 200) // Taille du thumbnail
      .toFile(path.join(__dirname, `../public/${thumbnailPath}`));

    // Mettre à jour le profil avec l'image et le thumbnail
    await user.update(
      { photo: imageUrl, thumbnail: thumbnailUrl }, // Enregistre l'URL de la photo et du thumbnail
      { where: { id: userId } }
    );

    const response = {
      photo: imageUrl,
      thumbnail: thumbnailUrl,
    };

    return res.status(200).json({
      status: "success",
      message: "Votre photo de profil a éte mise à jour avec succes.",
      data: response,
    });
  } catch (error) {
    console.error(`ERROR UPDATE PHOTO USER: ${error}`);
    appendErrorLog(`ERROR UPDATE PHOTO USER: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la mise à jour de la photo.",
    });
  }
};

const updateToken = async (req, res) => {
  try {
    const tokenHeader = req.headers.authorization;
    const { token } = req.body;
    if (!tokenHeader) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
    }

    // Vérifie si l'en-tête commence par "Bearer "
    if (!tokenHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Format de token invalide.",
      });
    }

    // Extrait le token en supprimant le préfixe "Bearer "
    const customToken = tokenHeader.substring(7);
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

    const userId = decodedToken.id;

    const existingUser = await User.findByPk(userId);
    if (!existingUser) {
      return res.status(404).json({
        status: "error",
        message: "Ce compte n'existe pas.",
      });
    }

    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir un token.",
      });
    }

    await User.update({ token }, { where: { id: userId } });

    return res.status(200).json({
      status: "success",
      message: "Token mis à jour avec succes.",
    });
  } catch (error) {
    console.error(`ERROR UPDATE TOKEN USER: ${error}`);
    appendErrorLog(`ERROR UPDATE TOKEN USER: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la mise à jour du token.",
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const { oldPassword, newPassword } = req.body;

    // Récupérer le worker et vérifier s'il existe
    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
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

    const customerId = decodedToken.id;

    const customer = await User.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        status: "error",
        message:
          "Compte non trouvé. Veuillez réessayer ou en créer un nouveau.",
      });
    }

    if (!oldPassword) {
      return res.status(400).json({
        status: "error",
        message: "Le mot de passe actuel est requis.",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Le nouveau mot de passe est requis.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      customer.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message:
          "Mot de passe invalide ou ne corresponde pas. Veuillez réessayer.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await customer.update({ password: hashedPassword });
    return res.status(200).json({
      status: "success",
      message: "Votre mot de passe à été mis à jour avec succes.",
    });
  } catch (error) {
    console.error(`ERROR UPDATE PASSWORD CUSTOMER: ${error}`);
    appendErrorLog(`ERROR UPDATE PASSWORD CUSTOMER: ${error}`);
    return res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la mise à jour du mot de passe.",
    });
  }
};

const reservationlist = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ status: "error", message: "Token invalide ou non fourni." });
    }

    const customToken = token.substring(7);
    let decodedToken;

    try {
      decodedToken = jwt.verify(customToken, process.env.JWT_SECRET);
    } catch (error) {
      return res
        .status(401)
        .json({ status: "error", message: "Token invalide ou expiré." });
    }

    const userId = decodedToken.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Compte non trouvé." });
    }

    const reservations = await Reservation.findAll({
      where: { userId, isShow: true },
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "carId",
        "carMovingId",
        "pharmacyId",
        "propertyId",
        "tourismId",
        "leisureId",
        "status",
        "amount",
        "date",
        "type",
        "days",
      ],
      include: [
        {
          model: Car,
          attributes: [
            "cityId",
            "name",
            "image",
            "priceWithoutDriver",
            "priceWithDriver",
            "licensePlate",
          ],
          required: false,
        },
        {
          model: Pharmacy,
          attributes: ["cityId", "name", "address"],
          required: false,
        },
        {
          model: Tourism,
          attributes: ["cityId", "title", "descriptions", "image"],
          required: false,
        },
        {
          model: Leisure,
          attributes: ["cityId", "title", "description"],
          required: false,
        },
        {
          model: CarMoving,
          attributes: ["cityId", "name", "image", "price", "licensePlate"],
          required: false,
        },
        {
          model: Property,
          attributes: ["cityId", "title", "image", "price"],
          required: false,
        },
      ],
    });

    const formattedReservations = reservations.map((reservation) => {
      let type = "";
      let description = "";
      let details = {};
      let status = "";
      let state = "";
      let carDetails = null;

      if (reservation.Car) {
        carDetails = {
          véhicule: reservation.Car.name,
          imageCar: reservation.Car.image,
          tarif:
            reservation.type === 1
              ? reservation.Car.priceWithoutDriver
              : reservation.Car.priceWithDriver,
          immatriculation: reservation.Car.licensePlate,
        };
        state = 7; 
      }

      if (reservation.Tourism) {
        type = carDetails
          ? "Réservation de visite touristique avec véhicule"
          : "Réservation de visite touristique";
        description = `Votre visite du site touristique ${reservation.Tourism.title} est programmée !`;
        state = state || 4;
        details = {
          cityId: reservation.Tourism.cityId,
          site: reservation.Tourism.title,
          description: reservation.Tourism.descriptions,
          image: reservation.Tourism.image,
          ...carDetails,
        };
      } else if (reservation.Leisure) {
        type = carDetails
          ? "Réservation d'un lieu de loisirs avec véhicule"
          : "Réservation d'un lieu de loisirs";
        description = `Profitez de votre moment de détente à ${reservation.Leisure.title} !`;
        state = state || 5;
        details = {
          cityId: reservation.Leisure.cityId,
          lieu: reservation.Leisure.title,
          description: reservation.Leisure.description,
          ...carDetails,
        };
      } else if (reservation.Property) {
        type = carDetails
          ? "Réservation de logement avec véhicule"
          : "Réservation de logement";
        description = `Votre réservation pour ${reservation.Property.title} est confirmée.`;
        state = state || 6;
        details = {
          cityId: reservation.Property.cityId,
          logement: reservation.Property.title,
          image: reservation.Property.image,
          tarif: reservation.Property.price,
          ...carDetails,
        };
      } else if (reservation.Pharmacy) {
        type = carDetails
          ? "Transport en taxi vers une pharmacie avec véhicule"
          : "Transport en taxi vers une pharmacie";
        description = `Votre transport vers ${reservation.Pharmacy.name} est confirmé.`;
        state = state || 3;
        details = {
          cityId: reservation.Pharmacy.cityId,
          pharmacie: reservation.Pharmacy.name,
          adresse: reservation.Pharmacy.address,
          ...carDetails,
        };
      } else if (reservation.CarMoving) {
        type =
          reservation.type === 1
            ? "Véhicule de déménagement sans équipe"
            : "Véhicule de déménagement avec équipe";
        description = `Votre véhicule de déménagement est réservé pour ${reservation.days} jour(s).`;
        state = 2;
        details = {
          cityId: reservation.CarMoving.cityId,
          véhicule: reservation.CarMoving.name,
          image: reservation.CarMoving.image,
          tarif: reservation.CarMoving.price,
          immatriculation: reservation.CarMoving.licensePlate,
        };
      } else if (reservation.Car) {
        type =
          reservation.type === 1
            ? "Location de véhicule sans chauffeur"
            : "Location de véhicule avec chauffeur";
        description = `Votre réservation pour ${reservation.days} jour(s) est enregistrée.`;
        state =  1;
        details = carDetails;
      }

      const formattedDate = new Date(reservation.date).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      if (status === 0) {
        statusText = "Annulé";
      } else if (status === 2) {
        statusText = "Confirmée";
      } else{
        statusText = "En attente de validation";
      }  

      return {
        id: reservation.id,
        type,
        date: formattedDate,
        montant: reservation.amount,
        description,
        statut: statusText,
        state,
        détails: details,
      };
    });

    return res
      .status(200)
      .json({ status: "success", data: formattedReservations });
  } catch (error) {
    console.error(`ERROR LIST RESERVATION: ${error}`);
    return res
      .status(500)
      .json({
        status: "error",
        message: "Erreur lors de la récupération des réservations.",
      });
  }
};

const notification = async (req, res) => {
  try {
    const customers = await User.findAll();

    customers.forEach(async (customer) => {
      const token = customer.token;
      const message = {
        token: token,
        data: {
          title: "TEST NOTIFICATION",
          body: `Ceci est une notification de test des rservations.`,
        },
      };
      await admin.messaging().send(message);
    });

    return res.status(200).json({
      status: "success",
      message: "Notification envoyée.",
      data: response,
    });
  } catch (error) {
    console.error(`ERROR NOTIFICATION: ${error}`);
    appendErrorLog(`ERROR NOTIFICATION: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de l'envoi de la notification.",
    });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const { reservationId } = req.body;
    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
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
          .json({ status: "error", message: "Votre session a expiré." });
      }
      return res
        .status(401)
        .json({ status: "error", message: "Token invalide." });
    }

    const userId = decodedToken.id;

    // Vérifier si la réservation existe et appartient à l'utilisateur
    const reservation = await Reservation.findOne({
      where: {
        id: reservationId,
        userId: userId,
      },
      include: [
        {
          model: User,
          attributes: ["firstname", "lastname", "token"],
        },
      ],
    });

    if (!reservation) {
      return res.status(404).json({
        status: "error",
        message: "Réservation non trouvée ou n'appartient pas à l'utilisateur.",
      });
    }

    // Vérifier si la réservation est déjà annulée
    if (reservation.status === 0) {
      return res.status(400).json({
        status: "error",
        message: "La réservation est déjà annulée.",
      });
    }

    // Mettre à jour le statut de la réservation à Annulé
    reservation.status = 0;
    await reservation.save();

    // Envoyer une notification à l'utilisateur
    if (reservation.User.token) {
      const message = {
        notification: {
          title: "Réservation annulée",
          body: `Votre réservation en date du ${new Date(
            reservation.date
          ).toLocaleString("fr-FR")} a été annulée avec succès.`,
        },
        token: reservation.User.token,
      };

      await admin
        .messaging()
        .send(message)
        .then((response) => {
          console.log("Notification d'annulation envoyée :", response);
        })
        .catch((error) => {
          console.error("Erreur lors de l'envoi de la notification :", error);
        });
    }

    return res.status(200).json({
      status: "success",
      message: "Votre réservation a été annulée avec succès.",
    });
  } catch (error) {
    console.error(`Erreur lors de l'annulation de la réservation : ${error}`);
    return res.status(500).json({
      status: "error",
      message:
        "Une erreur est survenue lors de l'annulation de la réservation.",
    });
  }
};

const deleteReservation = async (req, res) => {
  try {
    const { reservationId } = req.body;
    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
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
          .json({ status: "error", message: "Votre session a expiré." });
      }
      return res
        .status(401)
        .json({ status: "error", message: "Token invalide." });
    }

    const userId = decodedToken.id;

    // Vérifier si la réservation existe et appartient à l'utilisateur
    const reservation = await Reservation.findOne({
      where: {
        id: reservationId,
        userId: userId,
      },
      include: [
        {
          model: User,
          attributes: ["firstname", "lastname", "token"],
        },
      ],
    });

    if (!reservation) {
      return res.status(404).json({
        status: "error",
        message: "Réservation non trouvée ou n'appartient pas à l'utilisateur.",
      });
    }

    // Vérifier si la réservation est déjà annulée
    if (reservation.isShow === false) {
      return res.status(400).json({
        status: "error",
        message: "La réservation est déjà annulée.",
      });
    }

    // Annuler la réservation
    reservation.isShow = false;
    await reservation.save();

    // Envoyer une notification à l'utilisateur
    if (reservation.User.token) {
      const message = {
        notification: {
          title: "Réservation supprimée",
          body: `Votre réservation a été supprimée avec succès.`,
        },
        token: reservation.User.token,
      };

      await admin
        .messaging()
        .send(message)
        .then((response) => {
          console.log("Notification d'annulation envoyée :", response);
        })
        .catch((error) => {
          console.error("Erreur lors de l'envoi de la notification :", error);
        });
    }

    return res.status(200).json({
      status: "success",
      message: "Votre réservation a bien ete supprimée avec succès.",
    });
  } catch (error) {
    console.error(`Erreur lors de la suppression de la réservation : ${error}`);
    return res.status(500).json({
      status: "error",
      message:
        "Une erreur est survenue lors de la suppression de la réservation.",
    });
  }
};

const reservationCar = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const { bookingId, carId, payment, days, date, amount, type } = req.body;
    const host = req.get("host");
    const image = req.file;

    if (!bookingId) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "La réservation en cours est obligatoire.",
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
    if (!image) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Une piece jointe est obligatoire.",
        });
    }
    if (!payment) {
      return res
        .status(400)
        .json({ status: "error", message: "Le paiement est obligatoire." });
    }
    if (!carId) {
      return res.json({
        status: "error",
        message: "ID de la voiture est obligatoire.",
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
      return res
        .status(400)
        .json({ status: "error", message: "Le client n'existe pas." });
    }

    const car = await Car.findByPk(carId);
    if (!car) {
      return res
        .status(400)
        .json({ status: "error", message: "La voiture n'existe pas." });
    }

    const paymentMethod = await PaymentMethod.findByPk(payment);
    if (!paymentMethod) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Le moyen de paiement n'existe pas.",
        });
    }

    const reservation = await Reservation.findByPk(bookingId);
    if (!reservation) {
      return res
        .status(400)
        .json({ status: "error", message: "La reservation n'existe pas." });
    }

    // 🟢 Récupérer le montant actuel de la réservation
    const existingAmount = parseFloat(reservation.amount) || 0;

    // 🟢 Additionner le montant en cours avec le montant précédent
    const newAmount = existingAmount + parseFloat(amount);

    const imagePath = `attachments/${image.filename}`;
    const imageUrl = `${req.protocol}://${host}/${imagePath}`;

    reservation.update({
      carId: carId,
      attachment: imageUrl,
      amount: newAmount,
      type: 7,
    });

    // Envoi d'une notification au client, si un token est présent
    if (customer.token) {
      const userToken = customer.token;
      const message = {
        token: userToken,
        notification: {
          title: "Félicitations!",
          body: `Votre réservation de véhicule a été prise en compte avec succès. Rendez-vous à l'agence pour finaliser le paiement et récupérer votre véhicule. Merci de votre confiance !`,
        },
      };

      try {
        await admin.messaging().send(message);
        console.log(
          `Notification envoyée à l'utilisateur avec le token : ${userToken}`
        );
      } catch (error) {
        console.error(
          `Erreur lors de l'envoi de la notification : ${error.message}`
        );
        // Vous pouvez aussi enregistrer cette erreur dans vos logs pour un examen ultérieur
      }
    }

    return res.status(200).json({
      status: "success",
      message:
        "Votre reservation de véhicule a ete prise en compte avec succes.",
    });
  } catch (error) {
    console.error(`Erreur lors de la réservation d'un véhicule : ${error}`);
    appendErrorLog(`Erreur lors de la réservation d'un véhicule : ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur est survenue lors de la réservation d'un véhicule.",
    });
  }
};

module.exports = {
  create,
  login,
  photo,
  updateToken,
  updatePassword,
  reservationlist,
  notification,
  cancelReservation,
  deleteReservation,
  reservationCar,
};
