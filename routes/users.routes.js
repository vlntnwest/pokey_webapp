const express = require("express");
const usersController = require("../controllers/users.controller");

const router = express.Router();

//Users account
router.post("/account", usersController.create);
router.get("/account/:email", usersController.userInfo);
router.put("/account/:id", usersController.updateUser);

module.exports = router;
