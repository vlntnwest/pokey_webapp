const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/user.controllers");
const checkAuth = require("../middleware/auth.middleware");

router.get("/me", checkAuth, userControllers.getUserData);
router.put("/me", checkAuth, userControllers.updateUserData);
router.delete("/me", checkAuth, userControllers.deleteUser);

module.exports = router;
