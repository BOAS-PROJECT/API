const { City, Pharmacy } = require("../models");
const { appendErrorLog } = require("../utils/logging");

const create = async (req, res) => {
  try {
    const { name, address, cityId } = req.body;

    if (!name || !address || !cityId) {
      return res.status(400).json({
        status: "error",
        message: "Tous les champs sont obligatoires.",
      });
    }

    const city = await City.findOne({ where: { id: cityId } });
    if (!city) {
      return res.status(400).json({
        status: "error",
        message: "La ville n'existe pas.",
      });
    }

    await Pharmacy.create({ name, address, cityId });
    return res.status(201).json({
      status: "success",
      message: "Pharmacie cree avec succes.",
    });
  } catch (error) {
    console.error(`ERROR CREATE PHARMACY: ${error}`);
    appendErrorLog(`ERROR CREATE PHARMACY: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la creation de la pharmacie.",
    });
  }
};

const listpnr = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.findAll({
        where: { cityId: 2 },
      order: [["name", "ASC"]],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    return res.status(200).json({
      status: "success",
      data: pharmacies,
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

const listBzv = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.findAll({
      where: { cityId: 1 },
      order: [["name", "ASC"]],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    return res.status(200).json({
      status: "success",
      data: pharmacies,
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

module.exports = {
  create,
  listpnr,
  listBzv
};
