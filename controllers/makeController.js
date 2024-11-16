const sharp = require("sharp");
const path = require("path");
const { CarMake } = require("../models");
const { appendErrorLog } = require("../utils/logging");

const create = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }

        const existingMake = await CarMake.findOne({ where: { name } });

        if (existingMake) {
            return res.status(400).json({ error: "Make already exists" });
        }

        await CarMake.create({ name });

        return res.status(201).json({
            status: "success",
            message : "La marque a été cree avec succes."
        });
    } catch (error) {
        console.error(`ERROR CREATE MAKE: ${error}`);
        appendErrorLog(`ERROR CREATE MAKE: ${error}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const list = async (req, res) => {
    try {
        const makes = await CarMake.findAll();

        const formattedMakes = makes.map((make) => {
            return {
                id: make.id,
                name: make.name,
            };
        });

        return res.status(200).json({
            status: "success",
            data: formattedMakes,
        });
    } catch (error) {
        console.error(`ERROR LIST MAKE: ${error}`);
        appendErrorLog(`ERROR LIST MAKE: ${error}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

const destroy = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: "ID is required" });
        }

        await CarMake.destroy({ where: { id } });

        return res.status(200).json({
            status: "success",
            message : "La marque a ete supprimee avec succes."
        });
    } catch (error) {
        console.error(`ERROR DESTROY MAKE: ${error}`);
        appendErrorLog(`ERROR DESTROY MAKE: ${error}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = { create, list, destroy };