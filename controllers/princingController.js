const { Pricing } = require("../models");
const { Op } = require("sequelize");
const { appendErrorLog } = require("../utils/logging");

const create = async (req, res) => {
  try {
    const { type, distance, price, priceMax1, priceMax2 } = req.body;

    if (!type) {
      return res
        .status(400)
        .json({ status: "error", message: "Type is required" });
    }

    if (!distance) {
      return res
        .status(400)
        .json({ status: "error", message: "Distance is required" });
    }
    if (!price) {
      return res
        .status(400)
        .json({ status: "error", message: "Price is required" });
    }
    if (!priceMax1) {
      return res
        .status(400)
        .json({ status: "error", message: "PriceMax1 is required" });
    }
    if (!priceMax2) {
      return res
        .status(400)
        .json({ status: "error", message: "PriceMax2 is required" });
    }

    const existingDistance = await Pricing.findOne({
      where: { distance },
    });
    if (existingDistance) {
      return res
        .status(400)
        .json({ status: "error", message: "Distance already exists" });
    }
    await Pricing.create({
      type,
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
    appendErrorLog(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};
const getAll = async (req, res) => {
  try {
    const pricing = await Pricing.findAll({
      attributes: ["id", "type", "distance", "price", "priceMax1", "priceMax2"],
    });
    return res.status(200).json(pricing);
  } catch (error) {
    appendErrorLog(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

const calculate = async (req, res) => {
  try {
    const { type, distance } = req.body;

    if (!type) {
      return res
        .status(400)
        .json({ status: "error", message: "Type is required" });
    }
    if (!distance) {
      return res
        .status(400)
        .json({ status: "error", message: "Distance is required" });
    }

    // Trouver le tarif approprié dans la base de données
    const pricing = await Pricing.findAll({
      where: {
        type: type,
        distance: {
          [Op.gte]: distance,
        },
      },
      order: [["distance", "ASC"]], // Trier par distance croissante
      limit: 1, // Limiter à un seul résultat
    });

    if (pricing.length === 0) {
      return res
        .status(404)
        .json({
          status: "error",
          message: "No pricing found for the given type and distance",
        });
    }

    const selectedPricing = pricing[0];

    // Renvoyer les prix
    return res.status(200).json({
      status: "success",
      data: {
        amount: selectedPricing.price,
        amountmax1: selectedPricing.priceMax1,
        amountmax2: selectedPricing.priceMax2,
      },
    });
  } catch (error) {
    appendErrorLog(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};
module.exports = {
  create,
  getAll,
  calculate,
};
