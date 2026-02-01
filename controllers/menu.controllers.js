const logger = require("../logger");

module.exports.createProductCategorie = async (req, res, next) => {
  logger.info("createProductCategorie");
  return res.json({ message: "createProductCategorie" });
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
