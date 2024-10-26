const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Owner, Driver } = require("../models");
const { appendErrorLog } = require("../utils/logging");

const create = async (req, res) => {
  try {
    const host = req.get("host");
    const cni = req.file;
    const {
      driverId,
      firstName,
      lastName,
      nationality,
      phone,
      email,
      address,
      contrat,
      bank,
      rib,
    } = req.body;

    if (!driverId) {
      return res.status(400).json({
        status: "error",
        message: "Le numéro de téléphone est obligatoire.",
      });
    }

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

    if (!nationality) {
      return res.status(400).json({
        status: "error",
        message: "La nationalite est obligatoire.",
      });
    }

    if (!phone) {
      return res.status(400).json({
        status: "error",
        message: "Le numéro de téléphone est obligatoire.",
      });
    }

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "L'email est obligatoire.",
      });
    }

    if (!address) {
      return res.status(400).json({
        status: "error",
        message: "L'adresse est obligatoire.",
      });
    }

    if (!contrat) {
      return res.status(400).json({
        status: "error",
        message: "Le contrat est obligatoire.",
      });
    }

    if (!bank) {
      return res.status(400).json({
        status: "error",
        message: "La banque est obligatoire.",
      });
    }

    if (!rib) {
      return res.status(400).json({
        status: "error",
        message: "Le RIB est obligatoire.",
      });
    }

    const imagePath = `owners/${cni.filename}`;
    const imageUrl = `${req.protocol}://${host}/${imagePath}`;

    const existingOwner = await Owner.findOne({
      where: { phone, firstName, lastName },
    });
    if (existingOwner) {
      return res.status(400).json({
        status: "error",
        message: "Le compte existe deja.",
      });
    }

    // Vérification de si le driver existe
    const existingDriver = await Driver.findOne({ where: { id: driverId } });
    if (!existingDriver) {
      return res.status(400).json({
        status: "error",
        message: "Le driver n'existe pas.",
      });
    }

    await Owner.create({
      driverId,
      firstName,
      lastName,
      nationality,
      phone,
      email,
      address,
      cni: imageUrl ?? null,
      rib,
      bank,
      contrat,
    });
    return res.status(200).json({
      status: "success",
      message: "Le compte a bien été cree.",
    });
  } catch (error) {
    console.error(`ERROR CREATE OWNER: ${error}`);
    appendErrorLog(`ERROR CREATE OWNER: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la creation du compte.",
    });
  }
};

const listOwners = async (req, res) => {
  try {
    const owners = await Owner.findAll({ attributes: { exclude: ["driverId", "updatedAt", "createdAt"] }, order: [["firstName", "ASC"]] });
    return res.status(200).json({
      status: "success",
      data: owners,
    });
  } catch (error) {
    console.error(`ERROR LIST OWNERS: ${error}`);
    appendErrorLog(`ERROR LIST OWNERS: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la creation du compte.",
    });
  }
};

module.exports = { create, listOwners };
