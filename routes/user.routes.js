const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/user.controllers");
const checkAuth = require("../middleware/auth.middleware");

router.get("/:id", checkAuth, userControllers.getUserData);

module.exports = router;
