const express = require("express");
const usersController = require("../controllers/users.controller");

const router = express.Router();

//Users account
router.get("/account", usersController.getAllUsers);
router.get("/account/:email", usersController.userInfo);
router.post("/account", usersController.create);
router.put("/account/:id", usersController.updateUser);
router.delete("/account/:id", usersController.deleteUser);

module.exports = router;
