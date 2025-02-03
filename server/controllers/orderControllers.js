import Order from "../models/orderModel.js";
import User from "../models/userModel.js";

export const fetchOrders = async (req, res) => {
  const { clerkUserId } = req.params;

  const clerkUser = await User.findOne({ clerkUserId });

  try {
    const orders = await Order.find({ user: clerkUser._id }).sort({ _id: -1 });

    res.status(201).json(orders);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
