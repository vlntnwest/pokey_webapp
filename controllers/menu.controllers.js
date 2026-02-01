const prisma = require("../lib/prisma");
const logger = require("../logger");

module.exports.createProductCategorie = async (req, res, next) => {
  const { restaurantId } = req.params;
  const { name, subHeading, displayOrder } = req.body;

  try {
    const data = await prisma.category.create({
      data: {
        restaurantId,
        name,
        subHeading,
        displayOrder,
      },
    });
    logger.info({ responseId: data.id }, "Product categorie created");
    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports.updateProductCategorie = async (req, res, next) => {};

module.exports.deleteProductCategorie = async (req, res, next) => {};

module.exports.createProduct = async (req, res, next) => {};

module.exports.updateProduct = async (req, res, next) => {};

module.exports.deleteProduct = async (req, res, next) => {};

module.exports.createProductOptionGroup = async (req, res, next) => {};

module.exports.updateProductOptionGroup = async (req, res, next) => {};

module.exports.deleteProductOptionGroup = async (req, res, next) => {};

module.exports.createProductOptionChoice = async (req, res, next) => {};

module.exports.updateProductOptionChoice = async (req, res, next) => {};

module.exports.deleteProductOptionChoice = async (req, res, next) => {};
