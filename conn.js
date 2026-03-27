import mongoose from "mongoose";

export const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.log("MongoDB error:", err);
  }
};
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    pass: {
      type: String,
      required: true,
      minlength: 5,
    },
    role: { type: String, default: "user" },
    cart: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
    wishlist: [{ productId: { type: String }, _id: false }],
  },
  { timestamps: true },
);
export const User = mongoose.model("storeUser", userSchema);