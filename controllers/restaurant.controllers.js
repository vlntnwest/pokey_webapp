const prisma = require("../lib/prisma");
const { restaurantSchema } = require("../validators/schemas");

module.exports.createRestaurant = async (req, res) => {
  const result = restaurantSchema.safeParse(req.body);
  const user = req.user;

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }

  const { name, address, zipCode, city, phone, email, imageUrl } = result.data;

  try {
    const restaurant = await prisma.$transaction(async (tx) => {
      const created = await tx.restaurant.create({
        data: {
          managerId: user.id,
          name,
          address,
          zipCode,
          city,
          phone,
          email,
          imageUrl,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });

      return created;
    });

    return res.status(201).json({ restaurant });
  } catch (error) {
    console.log("Error creating restaurant", error.message);
    return res.status(500).json({ error: "Error creating restaurant" });
  }
};

module.exports.updateRestaurant = async (req, res) => {
  const result = restaurantSchema.partial().safeParse(req.body);
  const { id } = req.params;

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }

  if (Object.keys(result.data).length === 0) {
    return res.status(400).json({ error: "No data" });
  }
  try {
    const response = await prisma.restaurant.update({
      where: { id },
      data: result.data,
    });

    return res.status(200).json({ response });
  } catch (error) {
    console.log("Error updating restaurant", error.message);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    return res.status(500).json({ error: "Error updating restaurant" });
  }
};

module.exports.deleteRestaurant = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await prisma.restaurant.delete({
      where: { id },
    });
    console.log("Restaurant deleted successfully", response);
    return res
      .status(200)
      .json({ response: "Restaurant deleted successfully" });
  } catch (error) {
    console.log("Error deleting restaurant", error.message);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    return res.status(500).json({ error: "Error deleting restaurant" });
  }
};
