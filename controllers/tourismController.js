const { Tourism, City, TourismImage } = require("../models");
const { appendErrorLog } = require("../utils/logging");

const create = async (req, res) => {
  try {
    const host = req.get("host");
    const image = req.file;
    const { city, title, description } = req.body;

    if (!city) {
      return res.status(400).json({
        status: "error",
        message: "La ville est obligatoire.",
      });
    }

    if (!title) {
      return res.status(400).json({
        status: "error",
        message: "Le titre est obligatoire.",
      });
    }

    if (!description) {
      return res.status(400).json({
        status: "error",
        message: "La description est obligatoire.",
      });
    }

    if (!image) {
      return res.status(400).json({
        status: "error",
        message: "L'image est obligatoire.",
      });
    }

    const existingCity = await City.findOne({ where: { id: city } });
    if (!existingCity) {
      return res.status(400).json({
        status: "error",
        message: "La ville n'existe pas.",
      });
    }

    const existingTourism = await Tourism.findOne({ where: { title } });
    if (existingTourism) {
      return res.status(400).json({
        status: "error",
        message: "Un tourisme avec ce titre existe deja.",
      });
    }

    const imagePath = `tourisms/${image.filename}`;
    const imageUrl = `${req.protocol}://${host}/${imagePath}`;

    await Tourism.create({
      cityId: city,
      title,
      descriptions: description,
      image: imageUrl,
    });

    return res.status(201).json({
      status: "success",
      message: "Le tourisme a ete cree avec succes.",
    });
  } catch (error) {
    console.error(`ERROR CREATE TOURISM: ${error}`);
    appendErrorLog(`ERROR CREATE TOURISM: ${error}`);
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la creation du tourisme.",
    });
  }
};

const list = async (req, res) => {
    try {
        const images = await Tourism.findAll({
            exclude: ["createdAt", "updatedAt"],
            include: [
                {
                    model: TourismImage,
                    attributes: ["image"],
                },
            ]
        });

        const responseFormat = images.map((image) => ({
            id: image.id,
            title: image.title,
            description: image.description,
            image: image.TourismImage.image,
            images: image.TourismImage.map((image) => image.image),
        }));
        
        return res.status(200).json({
            status: "success",
            data: responseFormat,
        });
        
    } catch (error) {
        console.error(`ERROR LIST IMAGES: ${error}`);
        appendErrorLog(`ERROR LIST IMAGES: ${error}`);
        return res.status(500).json({
            status: "error",
            message: "Une erreur s'est produite lors de la creation du tourisme.",
        });
    }
}

module.exports ={ create, list};
