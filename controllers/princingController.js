const { Pricing, City } = require("../models");
const { Op } = require("sequelize");
const { appendErrorLog } = require("../utils/logging");

// Fonction utilitaire pour la validation des champs requis
const validateRequiredFields = (fields, res) => {
  for (const [field, value] of Object.entries(fields)) {
    if (!value) {
      return res
        .status(400)
        .json({ status: "error", message: `${field} is required` });
    }
  }
  return null;
};

// Fonction utilitaire pour gérer les erreurs
const handleError = (error, res, message = "Internal server error") => {
  appendErrorLog(error);
  console.error(`Error: ${message}:`, error);
  return res.status(500).json({ status: "error", message });
};

const create = async (req, res) => {
  try {
    const { city, type, distance, price, priceMax1, priceMax2 } = req.body;

    // Validation des champs requis
    const validationError = validateRequiredFields(
      { city, type, distance, price, priceMax1, priceMax2 },
      res
    );
    if (validationError) return validationError;

    // Vérification de la ville et de la distance en parallèle
    const [existingCity, existingDistance] = await Promise.all([
      City.findByPk(city),
      Pricing.findOne({
        where: { distance, type, cityId: city },
      }),
    ]);

    if (!existingCity) {
      return res
        .status(404)
        .json({ status: "error", message: "City not found" });
    }

    if (existingDistance) {
      return res
        .status(400)
        .json({ status: "error", message: "Distance already exists" });
    }

    await Pricing.create({
      type,
      cityId: city,
      distance,
      price,
      priceMax1,
      priceMax2,
    });

    return res.status(201).json({
      status: "success",
      message: "Pricing created successfully",
    });
  } catch (error) {
    return handleError(error, res, "Error creating pricing");
  }
};

const getAll = async (req, res) => {
  try {
    const pricing = await Pricing.findAll({
      attributes: ["type", "distance", "price", "priceMax1", "priceMax2"],
      include: [{
        model: City,
        attributes: ["name"],
      }],
    });
    return res.status(200).json(pricing);
  } catch (error) {
    return handleError(error, res, "Error fetching pricing");
  }
};

const calculate = async (req, res) => {
  try {
    const { city, type, distance } = req.body;

    const validationError = validateRequiredFields(
      { city, type, distance },
      res
    );
    if (validationError) return validationError;

    const pricing = await Pricing.findOne({
      where: {
        type,
        cityId: city,
        distance: {
          [Op.gte]: distance,
        },
      },
      order: [["distance", "ASC"]],
    });

    if (!pricing) {
      return res
        .status(404)
        .json({
          status: "error",
          message: "No pricing found for the given type and distance",
        });
    }

    return res.status(200).json({
      status: "success",
      data: {
        amountmax0: pricing.price,
        amountmax1: pricing.priceMax1,
        amountmax2: pricing.priceMax2,
      },
    });
  } catch (error) {
    return handleError(error, res, "Error calculating pricing");
  }
};

module.exports = {
  create,
  getAll,
  calculate,
};