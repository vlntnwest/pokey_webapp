const express = require("express");
const router = express.Router();
const memberControllers = require("../controllers/member.controllers");
const checkAuth = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/role.middleware");

router.get(
  "/restaurants/:restaurantId/members",
  checkAuth,
  isAdmin,
  memberControllers.getMembers,
);

module.exports = router;
