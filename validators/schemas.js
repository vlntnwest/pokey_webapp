const { z } = require("zod");

// Common schemas
const phoneSchema = z
  .string()
  .regex(
    /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
    "Invalid French phone number",
  );
// Order item types
const roleEnum = z.enum(["ADMIN", "STAFF", "CLIENT"]);

// User schemas
const updateUserSchema = z.object({
  fullName: z.string().min(1).max(50).optional(),
  phone: phoneSchema.optional(),
  role: roleEnum.optional(),
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

module.exports = {
  // User
  updateUserSchema,

  // Restaurant
  restaurantSchema,
};
