import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  barcode: {
    type: String,
    unique: false, // not all products will have a barcode
    sparse: true   // allows null/undefined values
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  category: {
    type: String,
    required: false,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String, // e.g., "kg", "litre", "piece"
    required: false
  },
  expiryDate: {
    type: Date,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Product", productSchema);
