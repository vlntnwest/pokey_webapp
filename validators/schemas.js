const { z } = require("zod");

// Common schemas
const phoneSchema = z
  .string()
  .regex(
    /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
    "Invalid French phone number",
  )
  .optional();

// Order item types
const roleEnum = z.enum(["ADMIN", "STAFF", "CLIENT"]);

// User schemas
const updateUserSchema = z.object({
  fullName: z.string().min(1).max(50).optional(),
  phone: phoneSchema,
  role: roleEnum.optional(),
});

module.exports = {
  // User
  updateUserSchema,
};
