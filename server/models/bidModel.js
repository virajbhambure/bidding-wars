import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    bid: Number,
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
  },
  { timestamps: true }
);

const Bid = mongoose.model("Bid", bidSchema);
export default Bid;
