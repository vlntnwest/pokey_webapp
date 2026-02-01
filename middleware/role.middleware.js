const logger = require("../logger");

const isOwner = (req, res, next) => {
  const user = req.user;
  const restaurantId = req.params.restaurantId;

  if (
    !user.restaurantMembers.some((member) => {
      const isMember = member.restaurantId === restaurantId;
      const isOwner = member.role === "OWNER";
      return isMember && isOwner;
    })
  ) {
    logger.warn(
      {
        userId: user.id,
        restaurantId: restaurantId,
      },
      "User is not owner of restaurant",
    );
    return res.status(403).json({ error: "Accès refusé" });
  }

  next();
};

const isAdmin = (req, res, next) => {
  const user = req.user;
  const restaurantId = req.params.restaurantId;

  if (
    !user.restaurantMembers.some((member) => {
      const isMember = member.restaurantId === restaurantId;
      const isOwner = member.role === "OWNER";
      const isAdmin = member.role === "ADMIN";
      return isMember && (isOwner || isAdmin);
    })
  ) {
    logger.warn(
      {
        userId: user.id,
        restaurantId: restaurantId,
      },
      "User is not admin of restaurant",
    );
    return res.status(403).json({ error: "Accès refusé" });
  }

  next();
};

const isStaff = (req, res, next) => {
  const user = req.user;
  const restaurantId = req.params.restaurantId;

  if (
    !user.restaurantMembers.some(
      (member) => member.restaurantId === restaurantId,
    )
  ) {
    logger.warn(
      {
        userId: user.id,
        restaurantId: restaurantId,
      },
      "User is not staff of restaurant",
    );
    return res.status(403).json({ error: "Accès refusé" });
  }

  next();
};

module.exports = {
  isOwner,
  isAdmin,
  isStaff,
};
