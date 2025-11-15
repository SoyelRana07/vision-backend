import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    photo: {
      type: [String],
      required: true,
    },
    // shipping: {
    //   type: Boolean,
    // },
    bulkDiscounts: [
      {
        quantity: { type: Number, required: true },
        discount: { type: Number, required: true }, // percentage, e.g. 5 for 5%
      },
    ],
    showSpecificationsTable: {
      type: Boolean,
      default: false,
    },
    specifications: {
      type: {
        brand: { type: String, default: "" },
        manufacturer: { type: String, default: "" },
        model: { type: String, default: "" },
        colour: { type: String, default: "" },
        material: { type: String, default: "" },
        numberOfItems: { type: String, default: "" },
        machineType: { type: String, default: "" },
        controllerType: { type: String, default: "" },
        controlMode: { type: String, default: "" },
        includedComponents: { type: String, default: "" },
        usageApplication: { type: String, default: "" },
        temperatureRange: { type: String, default: "" },
        timeRange: { type: String, default: "" },
        power: { type: String, default: "" },
        voltage: { type: String, default: "" },
        transferSize: { type: String, default: "" },
        transferPlateSaucerDia: { type: String, default: "" },
        machineDimension: { type: String, default: "" },
        machineWeight: { type: String, default: "" },
        packingDimension: { type: String, default: "" },
        packedItemWeight: { type: String, default: "" },
      },
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);