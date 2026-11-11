import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a category name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    emoji: {
      type: String,
      default: "🍽️", // Default emoji
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate category names for the same restaurant
CategorySchema.index({ restaurant: 1, name: 1 }, { unique: true });

// Check if model exists and delete it to prevent "OverwriteModelError" if we were re-compiling, 
// BUT for Schema updates to take effect in dev without restart, we sometimes need to force re-compile.
// However, safer is to just rely on export.
// For this specific issue where Schema didn't update:
if (process.env.NODE_ENV === "development") {
  if (mongoose.models.Category) {
    delete mongoose.models.Category;
  }
}

export default mongoose.models.Category || mongoose.model("Category", CategorySchema);
