const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models");
const { appendErrorLog } = require("../utils/logging");

const create = async (req, res) => {
  try {
    const { username, genre, birthday, city, email, phone, password } = req.body;
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      genre,
      birthday,
      city,
      email,
      phone,
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

module.exports = { create, login };
