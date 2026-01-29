const prisma = require("../lib/prisma");
const supabase = require("../lib/supabase");
const { updateUserSchema } = require("../validators/schemas");

module.exports.getUserData = async (req, res) => {
  const { id } = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports.updateUserData = async (req, res) => {
  const { id } = req.user;
  const result = updateUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.message });
  }

  const { fullName, phone, role } = result.data;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { fullName, phone, role },
    });
    return res.status(200).json({ user });
  } catch (error) {
    console.log(error.message);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    return res.status(500).json({ error: error.message });
  }
};

module.exports.deleteUser = async (req, res) => {
  const { id } = req.user;

  try {
    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) throw error;

    return res.status(200).json({ message: "Utilisateur supprimé" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};
