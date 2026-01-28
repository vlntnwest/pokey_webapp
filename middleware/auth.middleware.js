require("dotenv").config();
const prisma = require("../lib/prisma");
const supabase = require("../lib/supabase");

const checkAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Token invalide" });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    return res.status(401).json({ error: "Utilisateur non trouvé" });
  }

  req.user = dbUser;
  next();
};

module.exports = checkAuth;
