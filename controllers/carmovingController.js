const {  CarMoving, CarMake, Reservation, Customer } = require("../models");
const { appendErrorLog } = require("../utils/logging");

const create = async (req, res) => {
    try {
        const host = req.get("host");
        const image = req.file;
        const { makeId, name, volume, tonage, price, licensePlate } = req.body;

        if (!makeId) {
            return res
                .status(400)
                .json({ error: "ID de la marque est obligatoire." });
        }

        if (!name) {
            return res
                .status(400)
                .json({ error: "Le nom de la voiture est obligatoire." });
        }

        if (!volume) {
            return res
                .status(400)
                .json({ error: "Le volume de la voiture est obligatoire." });
        }

        if (!tonage) {
            return res
                .status(400)
                .json({ error: "Le tonnage de la voiture est obligatoire." });
        }

        if (!price) {
            return res
                .status(400)
                .json({ error: "Le prix de la voiture est obligatoire." });
        }

        if (!licensePlate) {
            return res
                .status(400)
                .json({ error: "Le plaque d'immatriculation de la voiture est obligatoire." });
        }

        const carMake = await CarMake.findByPk(makeId);
        if (!carMake) {
            return res
                .status(400)
                .json({ error: "La marque de la voiture n'existe pas." });
        }

        const existingCar = await CarMoving.findOne({ where: { name } });
        if (existingCar) {
            return res
                .status(400)
                .json({ error: "La voiture existe deja." });
        }

        const imagePath = `cars/${image.filename}`;
        const imageUrl = `${req.protocol}://${host}/${imagePath}`;

        await CarMoving.create({
            makeId,
            name,
            image: imageUrl,
            volume,
            tonage,
            price,
            licensePlate,
        });

        return res.status(201).json({
            status: "success",
            message: "Le véhicule a bien ete cree avec succes.",
        });
    } catch (error) {
        console.error(`ERROR CREATE CARMOVING: ${error}`);
        appendErrorLog(`ERROR CREATE CARMOVING: ${error}`);
        return res.status(500).json({
            status: "error",
            message: "Une erreur s'est produite lors de la creation du compte.",
        });
    }
}

const list = async (req, res) => {
    try {
        const cars = await CarMoving.findAll({
            attributes: { exclude: ["createdAt", "updatedAt"] },
            include: {
                model: CarMake,
                attributes: ["name"],
            },
        });
        
        const responseFormat = cars.map((car) => ({
            id: car.id,
            model: car.CarMake.name,
            name: car.name,
            image: car.image,
            volume: car.volume,
            tonage: car.tonage,
            price: car.price,
            licensePlate: car.licensePlate,
        }));
        
        return res.status(200).json({
            status: "success",
            data: responseFormat,
        });
    } catch (error) {
        console.error(`ERROR LIST CARMOVING: ${error}`);
        appendErrorLog(`ERROR LIST CARMOVING: ${error}`);
        return res.status(500).json({
            status: "error",
            message: "Une erreur s'est produite lors de la creation du compte.",
        });
    }
}


const reservation = async (req, res) => {
    try {
        const { customerId, carId, payment, days, date, amount } = req.body;
        const host = req.get("host");
        const image = req.file;
        if (!customerId) {
            return res
                .status(400)
                .json({ error: "ID du client est obligatoire." });
        }
        if (!days) {
            return res
                .status(400)
                .json({ error: "Le nombre de jours est obligatoire." });
        }
        if (!date) {
            return res
                .status(400)
                .json({ error: "La date est obligatoire." });
        }
        if (!amount) {
            return res
                .status(400)
                .json({ error: "Le montant est obligatoire." });
        }

        if (!image) {
            return res
                .status(400)
                .json({ error: "Une piece jointe est obligatoire." });
        }

        if (!payment) {
            return res
                .status(400)
                .json({ error: "Le paiement est obligatoire." });
        }

        if (!carId) {
            return res
                .status(400)
                .json({ error: "ID de la voiture est obligatoire." });
        }

        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            return res
                .status(400)
                .json({ error: "Le client n'existe pas." });
        }

        const car = await CarMoving.findByPk(carId);
        if (!car) {
            return res
                .status(400)
                .json({ error: "La voiture n'existe pas." });
        }

        const imagePath = `attachments/${image.filename}`;
        const imageUrl = `${req.protocol}://${host}/${imagePath}`;

        await Reservation.create({
            userId:customerId,
            carMovingId: carId,
            paymentMethodId: payment,
            days,
            date,
            amount,
            attachment: imageUrl,
        });

        return res.status(201).json({
            status: "success",
            message: "La reservation a bien ete cree avec succes.",
        });
    } catch (error) {
        console.error(`ERROR RESERVATION CARMOVING: ${error}`);
        appendErrorLog(`ERROR RESERVATION CARMOVING: ${error}`);
        return res.status(500).json({
            status: "error",
            message: "Une erreur s'est produite lors de la creation du compte.",
        });
    }
}

module.exports =  { create, list, reservation };