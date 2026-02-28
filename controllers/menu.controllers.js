const prisma = require("../lib/prisma");
const logger = require("../logger");

function applyTranslation(item, lang) {
  if (!item || !lang || !item.translations) return item;
  const t = item.translations[lang];
  if (!t) return item;
  return { ...item, ...t };
}

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
    return res.status(200).json({ data });
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
    return res.status(200).json({ message: "Product categorie deleted" });
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
    return res.status(200).json({ data });
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
    return res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports.createProductOptionGroup = async (req, res, next) => {
  const { productId } = req.params;
  const { name, hasMultiple, isRequired, minQuantity, maxQuantity } = req.body;

  try {
    const data = await prisma.optionGroup.create({
      data: {
        productId,
        name,
        hasMultiple,
        isRequired,
        minQuantity,
        maxQuantity,
      },
    });
    logger.info({ responseId: data.id }, "Option group created");
    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports.updateProductOptionGroup = async (req, res, next) => {
  const { optionGroupId } = req.params;
  const { name, hasMultiple, isRequired, minQuantity, maxQuantity } = req.body;

  try {
    const data = await prisma.optionGroup.update({
      where: {
        id: optionGroupId,
      },
      data: {
        name,
        hasMultiple,
        isRequired,
        minQuantity,
        maxQuantity,
      },
    });
    logger.info({ responseId: data.id }, "Option group updated");
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports.deleteProductOptionGroup = async (req, res, next) => {
  const { optionGroupId } = req.params;

  try {
    const data = await prisma.optionGroup.delete({
      where: {
        id: optionGroupId,
      },
    });
    logger.info({ responseId: data.id }, "Option group deleted");
    return res.status(200).json({ message: "Option group deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports.createProductOptionChoice = async (req, res, next) => {
  const { optionGroupId } = req.params;
  const { name, priceModifier } = req.body;

  try {
    const data = await prisma.optionChoice.create({
      data: {
        optionGroupId,
        name,
        priceModifier,
      },
    });
    logger.info({ responseId: data.id }, "Option choice created");
    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports.updateProductOptionChoice = async (req, res, next) => {
  const { optionChoiceId } = req.params;
  const { name, priceModifier } = req.body;

  try {
    const data = await prisma.optionChoice.update({
      where: {
        id: optionChoiceId,
      },
      data: {
        name,
        priceModifier,
      },
    });
    logger.info({ responseId: data.id }, "Option choice updated");
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports.deleteProductOptionChoice = async (req, res, next) => {
  const { optionChoiceId } = req.params;

  try {
    const data = await prisma.optionChoice.delete({
      where: {
        id: optionChoiceId,
      },
    });
    logger.info({ responseId: data.id }, "Option choice deleted");
    return res.status(200).json({ message: "Option choice deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports.updateCategorieTranslations = async (req, res, next) => {
  const { categorieId } = req.params;
  const { lang, name, subHeading } = req.body;

  try {
    const existing = await prisma.categorie.findUnique({ where: { id: categorieId } });
    if (!existing) return res.status(404).json({ error: "Category not found" });

    const translations = { ...(existing.translations || {}), [lang]: { name, subHeading } };
    const data = await prisma.categorie.update({
      where: { id: categorieId },
      data: { translations },
    });

    logger.info({ categorieId, lang }, "Category translation updated");
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports.updateProductTranslations = async (req, res, next) => {
  const { productId } = req.params;
  const { lang, name, description } = req.body;

  try {
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) return res.status(404).json({ error: "Product not found" });

    const translations = { ...(existing.translations || {}), [lang]: { name, description } };
    const data = await prisma.product.update({
      where: { id: productId },
      data: { translations },
    });

    logger.info({ productId, lang }, "Product translation updated");
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports.searchProducts = async (req, res, next) => {
  const { restaurantId } = req.params;
  const { q, isAvailable } = req.query;

  const where = { restaurantId };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (isAvailable !== undefined) {
    where.isAvailable = isAvailable === "true";
  }

  try {
    const data = await prisma.product.findMany({
      where,
      orderBy: { displayOrder: "asc" },
      include: {
        optionGroups: { include: { optionChoices: true } },
      },
    });

    logger.info({ restaurantId, q }, "Products searched");
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports.getMenu = async (req, res, next) => {
  const { restaurantId } = req.params;
  const { lang } = req.query;

  try {
    const categories = await prisma.categorie.findMany({
      where: { restaurantId },
      orderBy: { displayOrder: "asc" },
      include: {
        productCategories: {
          include: {
            product: {
              include: {
                optionGroups: {
                  include: {
                    optionChoices: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const data = lang
      ? categories.map((cat) => ({
          ...applyTranslation(cat, lang),
          productCategories: cat.productCategories.map((pc) => ({
            ...pc,
            product: applyTranslation(pc.product, lang),
          })),
        }))
      : categories;

    logger.info({ restaurantId, lang }, "Menu retrieved");
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports.getProduct = async (req, res, next) => {
  const { productId } = req.params;
  const { lang } = req.query;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productCategories: {
          include: { categorie: true },
        },
        optionGroups: {
          include: {
            optionChoices: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const data = lang ? applyTranslation(product, lang) : product;

    logger.info({ responseId: product.id }, "Product retrieved");
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};
