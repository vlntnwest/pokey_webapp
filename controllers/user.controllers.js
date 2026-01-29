const prisma = require("../lib/prisma");
const supabase = require("../lib/supabase");
const { updateUserSchema } = require("../validators/schemas");
const logger = require("../logger");

module.exports.getUserData = async (req, res, next) => {
  const { id } = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      logger.error("User not found");
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

module.exports.updateUserData = async (req, res, next) => {
  const { id } = req.user;
  const result = updateUserSchema.safeParse(req.body);

  if (!result.success) {
    logger.error({ issues: result.error.issues }, "Invalid user data");
    return res.status(400).json({ error: result.error.issues });
  }

  const { fullName, phone } = result.data;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { fullName, phone },
    });

    logger.info({ userId: user.id }, "User data updated successfully");
    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

module.exports.deleteUser = async (req, res, next) => {
  const { id } = req.user;

  try {
    await supabase.auth.admin.deleteUser(id);

    logger.info({ userId: id }, "User deleted successfully");
    return res.status(200).json({ message: "Utilisateur supprimé" });
  } catch (error) {
    next(error);
  }
};
