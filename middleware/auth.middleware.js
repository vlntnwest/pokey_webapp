const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

module.exports.checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log("Token verification error:", err);
        res.status(401).json({ error: "Unauthorized" }); // Réponse d'erreur appropriée
      } else {
        let user = await UserModel.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next(); // Vous pourriez envisager de retourner une réponse d'erreur ici également
  }
};

module.exports.requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  console.log("Token:", token); // Log du token pour vérifier sa présence
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log("Token verification error:", err); // Log de l'erreur
        return res.status(401).json({ error: "Unauthorized" });
      } else {
        console.log("Decoded Token:", decodedToken); // Log du token décodé
        return next();
      }
    });
  } else {
    console.log("No token provided"); // Log si aucun token n'est trouvé
    return res.status(401).json({ error: "No token provided" });
  }
};
