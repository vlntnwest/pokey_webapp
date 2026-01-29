const isOwner = (req, res, next) => {
  const user = req.user;
  const id = req.params.id;

  if (
    !user.restaurantMembers.some((member) => {
      const isMember = member.restaurantId === id;
      const isOwner = member.role === "OWNER";
      return isMember && isOwner;
    })
  ) {
    return res.status(403).json({ error: "Accès refusé" });
  }

  next();
};

const isAdmin = (req, res, next) => {
  const user = req.user;
  const id = req.params.id;

  if (
    !user.restaurantMembers.some((member) => {
      const isMember = member.restaurantId === id;
      const isOwner = member.role === "OWNER";
      const isAdmin = member.role === "ADMIN";
      return isMember && (isOwner || isAdmin);
    })
  ) {
    return res.status(403).json({ error: "Accès refusé" });
  }

  next();
};

const isStaff = (req, res, next) => {
  const user = req.user;
  const id = req.params.id;

  if (!user.restaurantMembers.some((member) => member.restaurantId === id)) {
    return res.status(403).json({ error: "Accès refusé" });
  }

  next();
};

module.exports = {
  isOwner,
  isAdmin,
  isStaff,
};
