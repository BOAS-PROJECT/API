const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sharp = require("sharp");
const path = require("path");
const multer = require("multer");
const { Driver, City } = require("../models");
const { appendErrorLog } = require("../utils/logging");

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

    const existingDriver = await Driver.findOne({
      where: { phone, isActive: false },
    });
    if (existingDriver) {
      return res.status(400).json({
        status: "error",
        message:
          "Votre compte a bien été créé et est en attente de validation. Merci de vous présenter à l'agence BOAS Service pour finaliser la vérification et l'activation de votre compte.",
      });
    }

    const driver = await Driver.findOne({ where: { phone, isActive: true } });
    if (!driver) {
      return res.status(400).json({
        status: "error",
        message:
          "Le compte n'existe pas, veuillez vous inscrire s'il vous plais.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, driver.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: "error",
        message: "Mot de passe invalide.",
      });
    }

    const token = jwt.sign(
      {
        id: driver.id,
        role: "isDriver",
      },
      process.env.JWT_SECRET
    );

    const response = {
      id: driver.id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      phone: driver.phone,
      photo: driver.photo,
      thumbnail: driver.thumbnail,
      city: driver.city,
      plate: driver.numberPlate,
      quarter: driver.quarter,
      birthday: driver.birthday,
      maritalStatus: driver.maritalStatus,
      token: token,
    };

    return res.status(200).json({
      status: "success",
      data: response,
    });
  } catch (error) {
    console.error(`ERROR LOGIN DRIVER: ${error}`);
    appendErrorLog(`ERROR LOGIN DRIVER: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la creation du compte.",
    });
  }
};

const create = async (req, res) => {
  try {
    const host = req.get("host");
    const photo = req.file;
    const {
      firstName,
      lastName,
      phone,
      plate,
      address,
      city_id,
      status,
      birth_date,
      password,
    } = req.body;

    if (!firstName) {
      return res.status(400).json({
        status: "error",
        message: "Le prenom est obligatoire.",
      });
    }

    if (!lastName) {
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

    if (!plate) {
      return res.status(400).json({
        status: "error",
        message: "La plaque d'immatriculation est obligatoire.",
      });
    }

    if (!address) {
      return res.status(400).json({
        status: "error",
        message: "L'adresse est obligatoire.",
      });
    }

    if (!city_id) {
      return res.status(400).json({
        status: "error",
        message: "La ville est de résidence obligatoire.",
      });
    }

    if (!status) {
      return res.status(400).json({
        status: "error",
        message: "La situation matrimoniale est obligatoire.",
      });
    }

    if (!birth_date) {
      return res.status(400).json({
        status: "error",
        message: "La date de naissance est obligatoire.",
      });
    }

    if (!password) {
      return res.status(400).json({
        status: "error",
        message: "Le mot de passe est obligatoire.",
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        status: "error",
        message: "Le mot de passe doit contenir au moins 4 caractères.",
      });
    }

    const existingCity = await City.findByPk(city_id);
    if (!existingCity) {
      return res.status(400).json({
        status: "error",
        message: "La ville n'existe pas.",
      });
    }

    const existingDriver = await Driver.findOne({ where: { phone } });
    if (existingDriver) {
      return res.status(400).json({
        status: "error",
        message: "Le numéro de téléphone est déjà utilisé.",
      });
    }

    const existingPlate = await Driver.findOne({
      where: { numberPlate: plate },
    });
    if (existingPlate) {
      return res.status(400).json({
        status: "error",
        message: "Cette plaque d'immatriculation est déjà utilisée.",
      });
    }

    // Générez et enregistrez l'image et le thumbnail
    const imagePath = `drivers/${photo.filename}`;
    const imageUrl = `${req.protocol}://${host}/${imagePath}`;
    const thumbnailFilename = `thumb_${photo.filename}`;
    const thumbnailPath = `drivers/${thumbnailFilename}`;
    const thumbnailUrl = `${req.protocol}://${host}/${thumbnailPath}`;

    await sharp(photo.path)
      .resize(200, 200)
      .toFile(path.join(__dirname, `../public/${thumbnailPath}`));

    const hashedPassword = await bcrypt.hash(password, 10);

    const driveruser = await Driver.create({
      cityId: city_id,
      firstName,
      lastName,
      maritalStatus: status,
      numberPlate: plate,
      phone,
      password: hashedPassword,
      birthday: birth_date,
      quarter: address,
      photo: imageUrl,
      thumbnail: thumbnailUrl,
      isActive: false,
    });

    const token = jwt.sign({ id: driveruser.id }, process.env.JWT_SECRET);
    await driveruser.save();

    const responseFormated = {
      id: driveruser.id,
      firstName: driveruser.firstName,
      lastName: driveruser.lastName,
      phone: driveruser.phone,
      photo: driveruser.photo,
      thumbnail: driveruser.thumbnail,
      city: driveruser.cityId,
      plate: driveruser.numberPlate,
      quarter: driveruser.quarter,
      birthday: driveruser.birthday,
      maritalStatus: driveruser.maritalStatus,
      token: token,
    };

    return res.status(201).json({
      status: "success",
      message:
        "Votre compte a été créé avec succès et est actuellement en attente de validation. Nous vous invitons à vous rendre à l'agence BOAS Service pour finaliser la vérification de votre compte.",
      data: responseFormated,
    });
  } catch (error) {
    console.error(`ERROR CREATE ACCOUNT DRIVER: ${error}`);
    appendErrorLog(`ERROR CREATE ACCOUNT DRIVER: ${error}`);
    return res.status(500).json({
      status: "error",
      message: `Une erreur s'est produite lors de la creation du compte.`,
    });
  }
};

const validateAccount = async (req, res) => {
  try {
    const { driverId, password } = req.body;

    const driver = await Driver.findOne({ id: { driverId } });
    if (!driver) {
      return res.status(400).json({
        status: "error",
        message:
          "Le compte n'existe pas, veuillez vous inscrire s'il vous plais.",
      });
    }

    if (driver.isActive) {
      return res.status(400).json({
        status: "error",
        message: "Le compte a deja ete activer.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await driver.update({ isActive: true, password: hashedPassword });
    return res.status(200).json({
      status: "success",
      message: "Compte activer avec succes.",
    });
  } catch (error) {
    console.error(`ERROR VALIDATE ACCOUNT DRIVER: ${error}`);
    appendErrorLog(`ERROR VALIDATE ACCOUNT DRIVER: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la creation du compte.",
    });
  }
};

const listActiveDrivers = async (req, res) => {
  try {
    const drivers = await Driver.findAll(
      {
        where: { isActive: true },
        attributes: { exclude: ["password", "isActive", "createdAt"] },
      },
      { order: [["name", "DESC"]] }
    );

    const formattedDrivers = drivers.map((driver) => {
      const formattedDriver = driver.toJSON();
      return {
        ...formattedDriver,
        fullName: `${formattedDriver.firstName} ${formattedDriver.lastName}`,
      };
    });

    return res.status(200).json({
      status: "success",
      data: formattedDrivers,
    });
  } catch (error) {
    console.error(`ERROR LIST ACTIVE DRIVER: ${error}`);
    appendErrorLog(`ERROR LIST ACTIVE DRIVER: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la creation du compte.",
    });
  }
};

const listInActiveDrivers = async (req, res) => {
  try {
    const drivers = await Driver.findAll(
      {
        where: { isActive: false },
        attributes: {
          exclude: ["password", "isActive", "createdAt", "token", "updatedAt"],
        },
      },
      { order: [["name", "DESC"]] }
    );

    const formattedDrivers = drivers.map((driver) => {
      const formattedDriver = driver.toJSON();
      return {
        ...formattedDriver,
        fullName: `${formattedDriver.firstName} ${formattedDriver.lastName}`,
      };
    });

    return res.status(200).json({
      status: "success",
      data: formattedDrivers,
    });
  } catch (error) {
    console.error(`ERROR LIST ACTIVE DRIVER: ${error}`);
    appendErrorLog(`ERROR LIST ACTIVE DRIVER: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la creation du compte.",
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

    const driverId = decodedToken.id;

    const existingDriver = await Driver.findByPk(driverId);
    if (!existingDriver) {
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

    await Driver.update({ token }, { where: { id: driverId } });

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

const uploadPhoto = async (req, res) => {
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

    const driverId = decodedToken.id;

    const driver = await Driver.findByPk(driverId);
    if (!driver) {
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
    const imagePath = `drivers/${photo.filename}`;
    const imageUrl = `${req.protocol}://${host}/${imagePath}`;
    const thumbnailFilename = `thumb_${photo.filename}`;
    const thumbnailPath = `drivers/${thumbnailFilename}`;
    const thumbnailUrl = `${req.protocol}://${host}/${thumbnailPath}`;

    // Créer le thumbnail avec sharp
    await sharp(photo.path)
      .resize(200, 200) // Taille du thumbnail
      .toFile(path.join(__dirname, `../public/${thumbnailPath}`));

    // Mettre à jour le profil avec l'image et le thumbnail
    await driver.update(
      { photo: imageUrl, thumbnail: thumbnailUrl }, // Enregistre l'URL de la photo et du thumbnail
      { where: { id: driverId } }
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
    console.error(`ERROR UPDATE PHOTO DRIVER: ${error}`);
    appendErrorLog(`ERROR UPDATE PHOTO DRIVER: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la mise à jour de la photo.",
    });
  }
};

const createPassword = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const { password } = req.body;
    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
    }

    if (!password) {
      return res.status(400).json({
        status: "error",
        message: "Le mot de passe est obligatoire.",
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

    const driverId = decodedToken.id;

    const driver = await Driver.findByPk(driverId);
    if (!driver) {
      return res.status(404).json({
        status: "error",
        message:
          "Compte non trouvé. Veuillez réessayer ou en créer un nouveau.",
      });
    }

    driver.password = password;
    await driver.save();
    return res.status(200).json({
      status: "success",
      message: "Mot de passe mis à jour avec succès.",
    });
  } catch (error) {
    console.error(`ERROR CREATE PASSWORD DRIVER: ${error}`);
    appendErrorLog(`ERROR CREATE PASSWORD DRIVER: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la mise à jour de la photo.",
    });
  }
};

const updateAvailability = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const { availability } = req.body;

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

    const driverId = decodedToken.id;

    const driver = await Driver.findByPk(driverId);
    if (!driver) {
      return res.status(404).json({
        status: "error",
        message:
          "Compte non trouvé. Veuillez réessayer ou en créer un nouveau.",
      });
    }

    driver.availability = availability;
    await driver.save();
    return res.status(200).json({
      status: "success",
      message: "Votre disponibilité a été mise à jour succès.",
    });
  } catch (error) {
    console.error(`ERROR UPDATE AVAILABILITY DRIVER: ${error}`);
    appendErrorLog(`ERROR UPDATE AVAILABILITY DRIVER: ${error}`);
    return res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la mise à jour de la disponibilité.",
    });
  }
}

module.exports = {
  create,
  validateAccount,
  listActiveDrivers,
  login,
  listInActiveDrivers,
  updateToken,
  uploadPhoto,
  createPassword,
  updateAvailability
};
