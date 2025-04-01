const { Taxi, City, CarMake, Owner } = require("../models");
const { appendErrorLog } = require("../utils/logging");
const { Op } = require("sequelize");

const create = async (req, res) => {
  try {
    const host = req.get("host");
    const image = req.file;
    const { city, make, owner, chassi, carteGrise, plaque } = req.body;

    if (!city) {
      return res.status(400).json({
        error: "La ville est obligatoire.",
      });
    }

    if (!owner) {
      return res.status(400).json({
        error: "Le propriétaire est obligatoire.",
      });
    }

    if (!make) {
      return res.status(400).json({
        error: "La marque est obligatoire.",
      });
    }

    if (!chassi) {
      return res.status(400).json({
        error: "Le chassis est obligatoire.",
      });
    }

    if (!carteGrise) {
      return res.status(400).json({
        error: "La carte grise est obligatoire.",
      });
    }

    if (!plaque) {
      return res.status(400).json({
        error: "La plaque est obligatoire.",
      });
    }

    if (!image) {
      return res.status(400).json({
        error: "L'image est obligatoire.",
      });
    }

    const existingCity = await City.findOne({ where: { id: city } });
    if (!existingCity) {
      return res.status(400).json({
        error: "La ville n'existe pas.",
      });
    }

    const existingMake = await CarMake.findOne({ where: { id: make } });
    if (!existingMake) {
      return res.status(400).json({
        error: "La marque n'existe pas.",
      });
    }

    const existingTaxi = await Taxi.findOne({ where: { chassi } });
    if (existingTaxi) {
      return res.status(400).json({
        error: "Un taxi avec ce chassis existe deja.",
      });
    }

    const existingOwner = await Owner.findOne({ where: { id: owner } });
    if (!existingOwner) {
      return res.status(400).json({
        error: "Le propriétaire n'existe pas.",
      });
    }

    const imagePath = `taxis/${image.filename}`;
    const imageUrl = `${req.protocol}://${host}/${imagePath}`;

    await Taxi.create({
      cityId: city,
      makeId: make,
      chassi,
      carteGrise,
      plaque,
      image: imageUrl,
    });

    return res.status(201).json({
      status: "success",
      message: "Le taxi a ete cree avec succes.",
    });
  } catch (error) {
    console.error(`ERROR CREATE TAXI: ${error}`);
    appendErrorLog(`ERROR CREATE TAXI: ${error}`);
    return res.status(500).json({
      error: "Une erreur s'est produite lors de la creation du taxi.",
    });
  }
};

const list = async (req, res) => {
    try {
        const taxis = await Taxi.findAll({
            include: [
                {
                    model: City,
                    attributes: ['id', 'name']
                },
                {
                    model: CarMake,
                    attributes: ['id', 'name']
                },
                {
                    model: Owner,
                    attributes: ['id', 'name']
                }
            ],
            attributes: ['id', 'type', 'cityId', 'makeId', 'ownerId', 'chassi', 'carteGrise', 'plaque', 'image']
        });
        return res.status(200).json({
            status: "success",
            data: taxis
        });
    } catch (error) {
        console.error(`ERROR LIST TAXI: ${error}`);
        appendErrorLog(`ERROR LIST TAXI: ${error}`);
        return res.status(500).json({
            error: "Une erreur s'est produite lors de la liste des taxis."
        });
    }
}

module.exports = { create, list };