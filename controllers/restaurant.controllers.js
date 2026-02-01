const prisma = require("../lib/prisma");
const { restaurantSchema } = require("../validators/schemas");
const logger = require("../logger");

module.exports.createRestaurant = async (req, res, next) => {
  const result = restaurantSchema.safeParse(req.body);
  const user = req.user;

  if (!result.success) {
    logger.error({ issues: result.error.issues }, "Invalid restaurant data");
    return res.status(400).json({ error: result.error.issues });
  }

  const { name, address, zipCode, city, phone, email, imageUrl } = result.data;

  try {
    const data = await prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data: {
          name,
          address,
          zipCode,
          city,
          phone,
          email,
          imageUrl,
        },
      });

      await tx.restaurantMember.create({
        data: {
          restaurantId: restaurant.id,
          userId: user.id,
          role: "OWNER",
        },
      });

      return restaurant;
    });
    logger.info({ responseId: data.id }, "Restaurant created successfully");
    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports.updateRestaurant = async (req, res, next) => {
  const result = restaurantSchema.partial().safeParse(req.body);
  const { restaurantId } = req.params;

  if (!result.success) {
    logger.error({ issues: result.error.issues }, "Invalid restaurant data");
    return res.status(400).json({ error: result.error.issues });
  }

  if (Object.keys(result.data).length === 0) {
    logger.error("No data to update");
    return res.status(400).json({ error: "No data" });
  }
  try {
    const data = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: result.data,
    });

    logger.info({ responseId: data.id }, "Restaurant updated successfully");
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports.deleteRestaurant = async (req, res, next) => {
  const { restaurantId } = req.params;

  try {
    await prisma.restaurant.delete({
      where: { id: restaurantId },
    });

    logger.info({ restaurantId }, "Restaurant deleted successfully");
    return res
      .status(200)
      .json({ response: "Restaurant deleted successfully" });
  } catch (error) {
    next(error);
  }
};
