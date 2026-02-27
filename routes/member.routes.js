const express = require("express");
const router = express.Router();
const memberControllers = require("../controllers/member.controllers");
const checkAuth = require("../middleware/auth.middleware");
const { isAdmin, isOwner } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");
const {
  inviteMemberSchema,
  acceptInvitationSchema,
} = require("../validators/schemas");

router.get(
  "/restaurants/:restaurantId/members",
  checkAuth,
  isAdmin,
  memberControllers.getMembers,
);

router.post(
  "/restaurants/:restaurantId/members/invite",
  checkAuth,
  isOwner,
  validate({ body: inviteMemberSchema }),
  memberControllers.inviteMember,
);

// Accept an invitation (auth required — user must be logged in)
router.post(
  "/members/accept",
  checkAuth,
  validate({ body: acceptInvitationSchema }),
  memberControllers.acceptInvitation,
);

module.exports = router;
