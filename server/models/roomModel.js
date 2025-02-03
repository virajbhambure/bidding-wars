import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomName: String,
    itemPic: String,
    bidders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    currentBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bid",
    },
    openingBid: Number,
    endsOn: String,
    claimed: { type: Boolean, default: false },
    roomAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);
export default Room;
