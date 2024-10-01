const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

module.exports.checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        // res.cookie("jwt", "", { maxAge: 1 }); // Delete cookie if err
      } else {
        let user = await UserModel.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

module.exports.requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log(err);
        return res.status(401).json({ error: "Unauthorized" }); // Retourne une erreur si le token est invalide
      } else {
        console.log(decodedToken.id);
        // Vous pouvez ajouter une logique supplémentaire ici pour récupérer l'utilisateur
        // const user = await UserModel.findById(decodedToken.id);
        // req.user = user; // Ajoutez l'utilisateur à la requête pour l'utiliser dans les routes
        return next(); // Appelle le middleware suivant si tout est bon
      }
    });
  } else {
    return res.status(401).json({ error: "No token provided" }); // Retourne une erreur si aucun token n'est présent
  }
};
