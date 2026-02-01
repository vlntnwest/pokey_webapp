const express = require("express");
const router = express.Router();
const menuControllers = require("../controllers/menu.controllers");
const checkAuth = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/role.middleware");

router.post(
  "/restaurants/:restaurantId/categories",
  checkAuth,
  isAdmin,
  menuControllers.createProductCategorie,
);
router.put(
  "/categories/:id",
  checkAuth,
  isAdmin,
  menuControllers.updateProductCategorie,
);
router.delete(
  "/categories/:id",
  checkAuth,
  isAdmin,
  menuControllers.deleteProductCategorie,
);

router.post(
  "/restaurants/:restaurantId/products",
  checkAuth,
  isAdmin,
  menuControllers.createProduct,
);
router.put("/products/:id", checkAuth, isAdmin, menuControllers.updateProduct);
router.delete(
  "/products/:id",
  checkAuth,
  isAdmin,
  menuControllers.deleteProduct,
);

router.post(
  "/products/:productId/option-groups",
  checkAuth,
  isAdmin,
  menuControllers.createProductOptionGroup,
);
router.put(
  "/option-groups/:id",
  checkAuth,
  isAdmin,
  menuControllers.updateProductOptionGroup,
);
router.delete(
  "/option-groups/:id",
  checkAuth,
  isAdmin,
  menuControllers.deleteProductOptionGroup,
);

router.post(
  "/option-groups/:optionId/option-choices",
  checkAuth,
  isAdmin,
  menuControllers.createProductOptionChoice,
);
router.put(
  "/option-choices/:optionId",
  checkAuth,
  isAdmin,
  menuControllers.updateProductOptionChoice,
);
router.delete(
  "/option-choices/:optionId",
  checkAuth,
  isAdmin,
  menuControllers.deleteProductOptionChoice,
);

module.exports = router;
