const express = require("express");
const userController = require("../controllers/user.controller");

const router = express.Router();

// user db
router.get("/", userController.getAllUsers);
router.get("/:id", userController.userInfo);
router.get("/username/:username", userController.userProfil);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
