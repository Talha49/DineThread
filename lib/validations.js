import { z } from "zod";

// --- Validations ---

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");
const slugSchema = z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens");

// User Schemas
export const UserRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const UserLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Restaurant Schemas
export const CreateRestaurantSchema = z.object({
  name: z.string().min(2, "Restaurant name is required"),
  restaurantId: slugSchema,
  type: z.string().optional(), // Cafe, Bar, etc.
  brandColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
});

const CustomThemeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name is required").max(40, "Name must be 40 characters or fewer"),
  emoji: z.string().max(8).optional(),
  // Zod v4's z.record requires an explicit key schema (unlike v3's
  // single-argument, string-keyed form)
  config: z.record(z.string(), z.any()),
  createdAt: z.union([z.string(), z.date()]).optional(),
});

export const UpdateBrandingSchema = z.object({
  brandColor: z.string().optional().nullable(),
  fontFamily: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  // experienceConfig otherwise stays permissive (designSystem/themeConfig carry
  // an evolving, deeply-nested design system config) - customThemes is the one
  // sub-field validated here since it's a new, user-authored, persisted list.
  experienceConfig: z.object({
    customThemes: z.array(CustomThemeSchema).max(50, "Too many saved themes").optional(),
  }).passthrough().optional(),
});

// Table Schemas (Order & Serve)
export const CreateTableSchema = z.object({
  label: z.string().min(1, "Label is required").max(40, "Label must be 40 characters or fewer"),
});

export const UpdateTableSchema = z.object({
  label: z.string().min(1, "Label is required").max(40, "Label must be 40 characters or fewer").optional(),
  isActive: z.boolean().optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(["placed", "preparing", "ready", "served", "paid"]),
});

// Order Schemas (Order & Serve) - prices are never trusted from the client;
// the server re-resolves menuItemId/variantId/modifierIds against the live
// MenuItem to compute the real total.
export const PlaceOrderSchema = z.object({
  restaurantId: z.string().min(1, "restaurantId is required"),
  tableId: objectIdSchema,
  items: z.array(z.object({
    menuItemId: objectIdSchema,
    variantId: objectIdSchema.optional(),
    modifierIds: z.array(objectIdSchema).max(20).optional(),
    qty: z.number().int().min(1).max(20),
  })).min(1, "Cart is empty"),
});

export const UpdateBusinessProfileSchema = z.object({
  businessProfile: z.object({
    description: z.string().max(500).optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    whatsapp: z.string().optional().or(z.literal('')),
    socialLinks: z.object({
      instagram: z.string().optional().or(z.literal('')),
      facebook: z.string().optional().or(z.literal('')),
      twitter: z.string().optional().or(z.literal('')),
      _id: z.string().optional(),
    }).optional(),
    openingHours: z.array(z.object({
      day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
      open: z.string().optional().or(z.literal('')),
      close: z.string().optional().or(z.literal('')),
      isClosed: z.boolean().default(false),
      _id: z.string().optional(),
    })).optional(),
  })
});

// Menu Item Schemas
export const MenuItemSchema = z.object({
  name: z.string().min(2, "Item name is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  description: z.string().max(500, "Description is too long").optional(),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal('')),
  isAvailable: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  isFeatured: z.boolean().default(false),
  // Variants for size options
  variants: z.array(z.object({
    name: z.string().min(1, "Variant name is required"),
    price: z.coerce.number().min(0, "Variant price must be positive"),
    isDefault: z.boolean().default(false),
  })).optional().default([]),
  // Modifiers for add-ons
  modifiers: z.array(z.object({
    name: z.string().min(1, "Modifier name is required"),
    price: z.coerce.number().min(0, "Modifier price must be positive"),
    category: z.string().optional(),
  })).optional().default([]),
});

export const UpdateMenuItemSchema = MenuItemSchema.partial();
