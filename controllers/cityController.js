const { City } = require("../models");
const { appendErrorLog } = require("../utils/logging");

const list = async (req, res) => {
    try {
        const cities = await City.findAll(
            { attributes: { exclude: ["createdAt", "updatedAt"] } },
        );

        const formattedCities = cities.map((city) => {
            return {
                id: city.id,
                name: city.name,
            };
        });
        
        return res.status(200).json({
            status: "success",
            data: formattedCities,
        });
        
    } catch (error) {
        console.error(`ERROR LIST CITY: ${error}`);
        appendErrorLog(`ERROR LIST CITY: ${error}`);
        return res.status(500).json({ 
            status: "error",
            message: "Une erreur s'est produite lors de la récuperation des villes.",
        });
    }
}

module.exports = { list };