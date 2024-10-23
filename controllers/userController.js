const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sharp = require("sharp");
const path = require("path");
const { User } = require("../models");
const { appendErrorLog } = require("../utils/logging");

const create = async (req, res) => {
  try {
    const host = req.get("host");
    const photo = req.file;
    const { username, genre, city, email, phone, password } = req.body;
    if (!username) {
      return res.status(400).json({
        status: "error",
        message: "Le nom d'utilisateur est obligatoire.",
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
      username,
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
      username: user.username,
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
        message: "Le compte n'existe pas, veuillez vous inscrire s'il vous plais.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: "error",
        message: "Le mot de passe est incorrect. Veuillez réessayer s'il vous plais.",
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
      username: user.username,
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
}

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

module.exports = { create, login, photo };
