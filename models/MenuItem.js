import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
      min: [0, "Price cannot be negative"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    category: {
      type: String,
      required: [true, "Please provide a category"],
      trim: true,
    },
    imageUrl: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Variants for size options (e.g., Small, Medium, Large)
    variants: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Variant price cannot be negative"],
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
    // Modifiers for add-ons (e.g., Extra Cheese, Bacon)
    modifiers: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Modifier price cannot be negative"],
        },
        category: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// Compound index for fetching a restaurant's menu items efficiently
// Also optimized for sorting by featured status and order
MenuItemSchema.index({ restaurant: 1, category: 1, isFeatured: -1, sortOrder: 1 });

// Ensure we don't use a cached model if we're in development and need schema updates
const MenuItem = mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);

// If the model exists but doesn't have the new fields (variants/modifiers), 
// we might need to recreate it in development environment.
// However, the most robust way in Next.js is just ensuring the schema is complete initially.

export default MenuItem;
