const express = require("express");
const usersController = require("../controllers/users.controller");
const { validate, validateObjectId } = require("../middleware/validate.middleware");
const { createUserSchema, updateUserSchema, emailParamSchema } = require("../validators/schemas");

const router = express.Router();

// Users account
router.get("/", usersController.getAllUsers);
router.get("/:email", validate({ params: emailParamSchema }), usersController.userInfo);
router.post("/", validate({ body: createUserSchema }), usersController.create);
router.put("/:id", validateObjectId(), validate({ body: updateUserSchema }), usersController.updateUser);
router.delete("/:id/:auth0Id", validateObjectId(), usersController.deleteUser);

module.exports = router;
