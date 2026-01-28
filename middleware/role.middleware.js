const isAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Accès refusé" });
  }
  next();
};

const isStaff = (req, res, next) => {
  if (!["ADMIN", "STAFF"].includes(req.user.role)) {
    return res.status(403).json({ error: "Accès refusé" });
  }
  next();
};

module.exports = {
  isAdmin,
  isStaff,
};
