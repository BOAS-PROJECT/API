const { Leisure, LeisureImage } = require("../models");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const { appendErrorLog } = require("../utils/logging");

const list = async (req, res) => {
    const cityId = req.headers.cityid;
    try {
        const leisure = await Leisure.findAll({
            include: [
                {
                    model: LeisureImage,
                    attributes: ["image"],
                },
            ],
            order: [["createdAt", "DESC"]],
            where: { cityId: cityId },
        });

       const responseFormat = leisure.map((leisure) => ({
            id: leisure.id,
            title: leisure.title,
            description: leisure.description,
            image: leisure.image,
            images: leisure.LeisureImages.map((image) => {
                return {
                    image: image.image,
                };
            }),
        }));
        
        return res.status(200).json({
            status: "success",
            data: responseFormat,
        });
    } catch (error) {
        console.error(`ERROR LIST PHARMACIES: ${error}`);
        appendErrorLog(`ERROR LIST PHARMACIES: ${error}`);
        return res.status(500).json({
            status: "error",
            message: "Une erreur s'est produite lors de la creation de la pharmacie.",
        });
    }
}

module.exports = {
    list
};