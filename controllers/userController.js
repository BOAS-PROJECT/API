const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sharp = require("sharp");
const path = require("path");
const admin = require("firebase-admin");
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
} = require("../models");
const { appendErrorLog } = require("../utils/logging");
const { token } = require("morgan");

const create = async (req, res) => {
  try {
    const host = req.get("host");
    const photo = req.file;
    const { firstname, lastname, genre, city, email, phone, password } =
      req.body;
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

    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message:
          "Un compte existe déjà pour ce numéro de téléphone, veuillez vous connecter ou choisir un autre numéro.",
      });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        status: "error",
        message:
          "Un compte existe déjà pour cet email, veuillez vous connecter ou choisir un autre email.",
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstname,
      lastname,
      genre,
      city,
      email,
      phone,
      photo: imageUrl ?? null,
      thumbnail: thumbnailUrl ?? null,
      password: hashedPassword,
    });

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
      city: user.city,
      email: user.email,
      phone: user.phone,
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

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Reservation,
          attributes: ["id", "status", "amount", "date", "type"],
          include: [
            {
              model: Car,
              attributes: [
                "name",
                "image",
                "priceWithoutDriver",
                "priceWithDriver",
                "licensePlate",
              ],
              required: false,
            },
            {
              model: Driver,
              attributes: [
                "firstName",
                "lastName",
                "maritalStatus",
                "numberPlate",
                "phone",
                "photo",
              ],
              required: false,
            },
            {
              model: Pharmacy,
              attributes: ["name", "address"],
              required: false,
            },
            {
              model: Tourism,
              attributes: ["title", "descriptions", "image"],
              required: false,
            },
            {
              model: Leisure,
              attributes: ["title", "description"],
              required: false,
            },
            {
              model: CarMoving,
              attributes: ["name", "image", "price", "licensePlate"],
              required: false,
            },
            {
              model: Property,
              attributes: ["title", "image", "price"],
              required: false,
            }
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message:
          "Compte non trouvé. Veuillez réessayer ou en créer un nouveau.",
      });
    }

    const formattedReservations = user.Reservations.map((reservation) => {
      let type = null;

      if (reservation.Car) {
        if (reservation.carId && reservation.driverId) {
          type = "Réservation de Taxi (véhicule avec chauffeur)";
        } else if (reservation.carId && !reservation.driverId) {
          type = "Réservation de Véhicule sans chauffeur";
        } else {
          type = "Réservation de Taxi";
        }
      } else if (reservation.Driver) {
        type = "Réservation de Chauffeur";
      } else if (reservation.Pharmacy) {
        type = "Réservation de Pharmacie";
      } else if (reservation.Tourism) {
        type = "Réservation de Tourisme";
      } else if (reservation.Leisure) {
        type = "Réservation de Loisirs";
      } else if (reservation.CarMoving) {
        type = "Réservation véhicule de déménagement";
      } else if (reservation.Property) {
        type = "Réservation logement";
      }

      const formattedDate = new Date(reservation.date).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        type,
        date: formattedDate,
        amount: reservation.amount,
        description: reservation.type,
        status: reservation.status === 1 ? "En attente" : "Confirmé",
      };
    });

    return res.status(200).json({
      status: "success",
      data: formattedReservations,
    });
  } catch (error) {
    console.error(`ERROR LIST RESERVATION: ${error}`);
    appendErrorLog(`ERROR LIST RESERVATION: ${error}`);
    return res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la récupération des réservations.",
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
        notification: {
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

module.exports = {
  create,
  login,
  photo,
  updateToken,
  updatePassword,
  reservationlist,
  notification,
};
