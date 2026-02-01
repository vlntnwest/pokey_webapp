const { z } = require("zod");

// Common schemas
const phoneSchema = z
  .string()
  .regex(
    /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
    "Invalid French phone number",
  );

// User schemas
const updateUserSchema = z.object({
  fullName: z.string().min(1).max(50).optional(),
  phone: phoneSchema.optional(),
});

const restaurantSchema = z.object({
  name: z.string().min(1).max(50),
  address: z.string().min(1).max(255),
  zipCode: z
    .string()
    .min(1)
    .max(5)
    .regex(/^[0-9]{5}$/),
  city: z.string().min(1).max(50),
  phone: phoneSchema,
  email: z.string().email().optional(),
  imageUrl: z.string().url().optional(),
});

const categorieSchema = z.object({
  restaurantId: z.string().uuid(),
  name: z.string().min(1).max(50),
  subHeading: z.string().min(1).max(255).optional(),
  displayOrder: z.number(),
});

const updateCategorieSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  subHeading: z.string().min(1).max(255).optional(),
  displayOrder: z.number().optional(),
});

const productSchema = z.object({
  restaurantId: z.string().uuid(),
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(255),
  imageUrl: z.string().url(),
  price: z.number(),
  tags: z.array(z.string()).optional(),
  discount: z.number().default(0),
  isAvailable: z.boolean().default(true),
  displayOrder: z.number().default(999),
  categorieId: z.string().uuid(),
});

const updateProductSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().min(1).max(255).optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().optional(),
  tags: z.array(z.string()).optional(),
  discount: z.number().default(0).optional(),
  isAvailable: z.boolean().default(true).optional(),
  displayOrder: z.number().optional(),
  categorieId: z.string().uuid().optional(),
});

const productOptionGroupSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1).max(50),
  hasMultiple: z.boolean().default(false),
  isRequired: z.boolean().default(false),
  minQuantity: z.number().default(1),
  maxQuantity: z.number().default(1),
});

const productOptionChoiceSchema = z.object({
  optionGroupId: z.string().uuid(),
  name: z.string().min(1).max(50),
  priceModifier: z.number().default(0),
});

module.exports = {
  // User
  updateUserSchema,

  // Restaurant
  restaurantSchema,

  // Menu
  categorieSchema,
  updateCategorieSchema,
  productSchema,
  updateProductSchema,
  productOptionGroupSchema,
  productOptionChoiceSchema,
};
