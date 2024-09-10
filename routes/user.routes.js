const express = require("express");
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");

const router = express.Router();

// auth
router.post("/register", authController.signUp);
router.post("/login", authController.signIn);
router.get("/logout", authController.logout);

//forgot password
router.post("/forgot-password", authController.forgotPassword);
router.get("/reset-password/:token", authController.resetPassword);
router.put("/reset-password", authController.updatePassword);

// user db
router.get("/", userController.getAllUsers);
router.get("/:id", userController.userInfo);
router.get("/username/:username", userController.userProfil);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
