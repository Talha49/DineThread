import mongoose from "mongoose";

// Deliberately minimal - one document per view/scan. No auth is attached to
// these writes (the public menu page has no session), so this collection
// only ever stores a restaurant reference, a type, and a timestamp - nothing
// that identifies a visitor.
const AnalyticsEventSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["view", "qr_scan"],
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AnalyticsEventSchema.index({ restaurant: 1, createdAt: -1 });

export default mongoose.models.AnalyticsEvent || mongoose.model("AnalyticsEvent", AnalyticsEventSchema);
