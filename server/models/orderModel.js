import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: String,
    pic: String,
    amount: Number,
    address: { type: Object },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
