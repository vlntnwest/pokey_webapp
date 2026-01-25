const { z } = require("zod");

// Common schemas
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

const phoneSchema = z.string().regex(
  /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
  "Invalid French phone number"
).optional();

// Order item types
const itemTypeEnum = z.enum(["bowl", "side", "drink", "dessert", "custom"]);
const orderTypeEnum = z.enum(["dine-in", "clickandcollect"]);

// Order item schema
const orderItemSchema = z.object({
  type: itemTypeEnum,
  name: z.string().min(1, "Item name is required").max(100),
  base: z.string().max(50).optional().default(""),
  proteins: z.array(z.string().max(50)).optional().default([]),
  extraProtein: z.array(z.string().max(50)).optional().default([]),
  extraProteinPrice: z.number().min(0).optional().default(0),
  garnishes: z.array(z.string().max(50)).optional().default([]),
  toppings: z.array(z.string().max(50)).optional().default([]),
  sauces: z.array(z.string().max(50)).optional().default([]),
  quantity: z.number().int().min(1).max(99),
  price: z.number().min(0).optional(),
});

// Order date schema (for click & collect)
const orderDateSchema = z.object({
  date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be DD/MM/YYYY"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM"),
});

// Client data schema
const clientDataSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email("Invalid email").optional(),
  phone: phoneSchema,
});

// Create order schema
const createOrderSchema = z.object({
  userId: z.string().optional(),
  orderType: orderTypeEnum,
  tableNumber: z.number().int().min(1).max(999).optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  orderDate: orderDateSchema.optional(),
  specialInstructions: z.string().max(500).optional(),
  totalPrice: z.number().min(0),
  clientData: clientDataSchema.optional(),
}).refine(
  (data) => {
    // If dine-in, tableNumber is required
    if (data.orderType === "dine-in" && !data.tableNumber) {
      return false;
    }
    return true;
  },
  { message: "Table number is required for dine-in orders", path: ["tableNumber"] }
).refine(
  (data) => {
    // If click & collect, orderDate is required
    if (data.orderType === "clickandcollect" && !data.orderDate) {
      return false;
    }
    return true;
  },
  { message: "Order date is required for click & collect orders", path: ["orderDate"] }
);

// User schemas
const createUserSchema = z.object({
  email: z.string().email("Invalid email"),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: phoneSchema,
  shouldGiveInformation: z.boolean().optional().default(true),
});

const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: phoneSchema,
  shouldGiveInformation: z.boolean().optional(),
});

// Table schemas
const createTableSchema = z.object({
  tableNumber: z.number().int().min(1).max(999),
  isOpen: z.boolean().optional().default(true),
});

// Menu item schemas
const menuItemTypeEnum = z.enum(["bowl", "side", "drink", "dessert", "custom"]);

const bowlDetailsSchema = z.object({
  type: z.enum(["signature", "custom"]).optional(),
  proteins: z.array(z.string()).optional(),
  garnishes: z.array(z.string()).optional(),
  toppings: z.array(z.string()).optional(),
});

const drinkInfoSchema = z.object({
  variant: z.array(z.string()).optional(),
  size: z.string().optional(),
});

const createMenuItemSchema = z.object({
  name: z.string().min(1).max(100),
  type: menuItemTypeEnum,
  price: z.union([z.string(), z.number()]).transform((val) => String(val)),
  description: z.string().max(500).optional(),
  picture: z.string().url().optional(),
  isPopular: z.boolean().optional().default(false),
  bowlDetails: bowlDetailsSchema.optional(),
  drinkInfo: drinkInfoSchema.optional(),
});

// Custom item schema
const createCustomItemSchema = z.object({
  category: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  price: z.number().min(0).optional(),
  hasSauce: z.boolean().optional().default(false),
});

// Allergen schema
const createAllergenSchema = z.object({
  name: z.string().min(1).max(50),
});

// Food schema
const createFoodSchema = z.object({
  name: z.string().min(1).max(100),
  allergens: z.array(z.object({
    allergen: objectIdSchema,
    level: z.enum(["none", "pistesDe", "pistesPossiblesDe", "contient"]).optional(),
  })).optional(),
});

// Payment schema
const createCheckoutSessionSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    picture: z.string().optional(),
    price: z.number().min(0),
    quantity: z.number().int().min(1),
  })).min(1),
  orderData: createOrderSchema,
});

// Param schemas
const idParamSchema = z.object({
  id: objectIdSchema,
});

const emailParamSchema = z.object({
  email: z.string().email(),
});

const tableNumberParamSchema = z.object({
  tableNumber: z.string().regex(/^\d+$/).transform(Number),
});

module.exports = {
  // Order
  createOrderSchema,
  orderItemSchema,

  // User
  createUserSchema,
  updateUserSchema,

  // Table
  createTableSchema,

  // Menu
  createMenuItemSchema,
  createCustomItemSchema,

  // Allergen & Food
  createAllergenSchema,
  createFoodSchema,

  // Payment
  createCheckoutSessionSchema,

  // Params
  idParamSchema,
  emailParamSchema,
  tableNumberParamSchema,

  // Common
  objectIdSchema,
};
