import mongoose from "mongoose";

// A table is just a name the owner picks (e.g. "Table 4"). Customers select
// it themselves on the restaurant's existing public menu link - there's no
// per-table QR/URL, so no public token is needed here.
const TableSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    label: {
      type: String,
      required: [true, "Please provide a table label"],
      trim: true,
      maxlength: [40, "Label cannot be more than 40 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

TableSchema.index({ restaurant: 1, label: 1 }, { unique: true });

if (process.env.NODE_ENV === "development") {
  if (mongoose.models.Table) {
    delete mongoose.models.Table;
  }
}

export default mongoose.models.Table || mongoose.model("Table", TableSchema);
