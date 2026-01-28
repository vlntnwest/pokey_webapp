require("dotenv").config();

const supabase = require("../lib/supabase");

const checkAuth = async (req, res, next) => {
  console.log("=== checkAuth middleware appelé ===");
  const token = req.headers.authorization?.replace("Bearer ", "");
  console.log("Token reçu:", token);

  if (!token) {
    console.log("Pas de token → 401");
    return res.status(401).json({ error: "Non authentifié" });
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Token invalide" });
  }

  req.user = user;
  next();
};

module.exports = checkAuth;
