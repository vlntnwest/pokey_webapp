const prisma = require("../lib/prisma");
const logger = require("../logger");

module.exports.getMembers = async (req, res, next) => {
  const { restaurantId } = req.params;

  try {
    const data = await prisma.restaurantMember.findMany({
      where: { restaurantId },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, phone: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    logger.info({ restaurantId }, "Members retrieved");
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};
