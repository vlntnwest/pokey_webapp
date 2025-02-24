const express = require("express");
const usersController = require("../controllers/users.controller");

const router = express.Router();

//Users account
router.get("/", usersController.getAllUsers);
router.get("/:email", usersController.userInfo);
router.post("/", usersController.create);
router.put("/:id", usersController.updateUser);
router.delete("/:id/:auth0Id", usersController.deleteUser);

module.exports = router;
