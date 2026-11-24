import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
    // Snapshotted at order time so a later menu edit never changes a placed order's bill.
    name: { type: String, required: true },
    variantName: { type: String },
    modifierNames: { type: [String], default: [] },
    unitPrice: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    ownerHash: { type: String, select: false },
    requestId: { type: String },
    requestFingerprint: { type: String, select: false },
    // Terminal rejection/cancellation receipts share the same unique key as
    // accepted orders. They never enter the kitchen queue.
    submissionOutcome: { type: String, enum: ["accepted", "rejected", "cancelled"], default: "accepted" },
    rejectionCode: { type: String },
    rejectionMessage: { type: String },
    rejectionDetails: { type: mongoose.Schema.Types.Mixed },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: function (v) { return Array.isArray(v) && (this.submissionOutcome !== "accepted" || v.length > 0); },
    },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["placed", "preparing", "ready", "served", "paid"],
      default: "placed",
      index: true,
    },
    billRequested: { type: Boolean, default: false },
    workflowVersion: { type: Number, default: 0, min: 0 },
    workflowHistory: { type: [mongoose.Schema.Types.Mixed], default: [], select: false },
    statusUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

OrderSchema.index({ restaurant: 1, requestId: 1 }, {
  unique: true,
  name: "restaurant_request_unique",
  partialFilterExpression: { requestId: { $type: "string" } },
});

if (process.env.NODE_ENV === "development") {
  if (mongoose.models.Order) {
    delete mongoose.models.Order;
  }
}

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
