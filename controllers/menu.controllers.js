const prisma = require("../lib/prisma");
const logger = require("../logger");

module.exports.createProductCategorie = async (req, res, next) => {
  const { restaurantId } = req.params;
  const { name, subHeading, displayOrder } = req.body;

  try {
    const data = await prisma.categorie.create({
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

module.exports.updateProductCategorie = async (req, res, next) => {
  const { categorieId } = req.params;
  const { name, subHeading, displayOrder } = req.body;

  try {
    const data = await prisma.categorie.update({
      where: {
        id: categorieId,
      },
      data: {
        name,
        subHeading,
        displayOrder,
      },
    });
    logger.info({ responseId: data.id }, "Product categorie updated");
    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports.deleteProductCategorie = async (req, res, next) => {
  const { categorieId } = req.params;

  try {
    const data = await prisma.categorie.delete({
      where: {
        id: categorieId,
      },
    });
    logger.info({ responseId: data.id }, "Product categorie deleted");
    return res.status(201).json("Product categorie deleted");
  } catch (error) {
    next(error);
  }
};

module.exports.createProduct = async (req, res, next) => {
  const { restaurantId } = req.params;
  const {
    name,
    description,
    imageUrl,
    price,
    tags,
    discount,
    isAvailable,
    displayOrder,
    categorieId,
  } = req.body;

  try {
    const data = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          restaurantId,
          name,
          description,
          imageUrl,
          price,
          tags,
          discount,
          isAvailable,
          displayOrder,
        },
      });

      await tx.productCategorie.create({
        data: {
          productId: product.id,
          categorieId: categorieId,
        },
      });

      return product;
    });

    logger.info({ responseId: data.id }, "Product created");
    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports.updateProduct = async (req, res, next) => {
  const { productId } = req.params;
  const {
    name,
    description,
    imageUrl,
    price,
    tags,
    discount,
    isAvailable,
    displayOrder,
    categorieId,
  } = req.body;

  try {
    const data = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          name,
          description,
          imageUrl,
          price,
          tags,
          discount,
          isAvailable,
          displayOrder,
        },
      });

      const actualCategorie = await tx.productCategorie.findMany({
        where: {
          productId: productId,
        },
      });

      if (
        !categorieId ||
        actualCategorie.some(
          (categorie) => categorie.categorieId === categorieId,
        )
      ) {
        return product;
      }

      await tx.productCategorie.create({
        data: {
          productId: product.id,
          categorieId: categorieId,
        },
      });

      return product;
    });

    logger.info({ responseId: data.id }, "Product updated");
    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports.deleteProduct = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const data = await prisma.product.delete({
      where: {
        id: productId,
      },
    });
    logger.info({ responseId: data.id }, "Product deleted");
    return res.status(201).json("Product deleted");
  } catch (error) {
    next(error);
  }
};

module.exports.createProductOptionGroup = async (req, res, next) => {};

module.exports.updateProductOptionGroup = async (req, res, next) => {};

module.exports.deleteProductOptionGroup = async (req, res, next) => {};

module.exports.createProductOptionChoice = async (req, res, next) => {};

module.exports.updateProductOptionChoice = async (req, res, next) => {};

module.exports.deleteProductOptionChoice = async (req, res, next) => {};
