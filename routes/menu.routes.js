const express = require("express");
const router = express.Router();
const menuControllers = require("../controllers/menu.controllers");
const checkAuth = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");
const {
  categorySchema,
  updateCategorySchema,
} = require("../validators/schemas");

router.post(
  "/restaurants/:restaurantId/categories",
  checkAuth,
  isAdmin,
  validate({ body: categorySchema }),
  menuControllers.createProductCategorie,
);
router.put(
  "/restaurants/:restaurantId/categories/:categorieId",
  checkAuth,
  isAdmin,
  validate({ body: updateCategorySchema }),
  menuControllers.updateProductCategorie,
);
router.delete(
  "/restaurants/:restaurantId/categories/:categorieId",
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
router.put(
  "/restaurants/:restaurantId/products/:productId",
  checkAuth,
  isAdmin,
  menuControllers.updateProduct,
);
router.delete(
  "/restaurants/:restaurantId/products/:productId",
  checkAuth,
  isAdmin,
  menuControllers.deleteProduct,
);

router.post(
  "/restaurants/:restaurantId/products/:productId/option-groups",
  checkAuth,
  isAdmin,
  menuControllers.createProductOptionGroup,
);
router.put(
  "/restaurants/:restaurantId/option-groups/:optionGroupId",
  checkAuth,
  isAdmin,
  menuControllers.updateProductOptionGroup,
);
router.delete(
  "/restaurants/:restaurantId/option-groups/:id",
  checkAuth,
  isAdmin,
  menuControllers.deleteProductOptionGroup,
);

router.post(
  "/restaurants/:restaurantId/option-groups/:optionId/option-choices",
  checkAuth,
  isAdmin,
  menuControllers.createProductOptionChoice,
);
router.put(
  "/restaurants/:restaurantId/option-choices/:optionId",
  checkAuth,
  isAdmin,
  menuControllers.updateProductOptionChoice,
);
router.delete(
  "/restaurants/:restaurantId/option-choices/:optionId",
  checkAuth,
  isAdmin,
  menuControllers.deleteProductOptionChoice,
);

module.exports = router;
