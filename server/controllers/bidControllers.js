import Bid from "../models/bidModel.js";
import Room from "../models/roomModel.js";
import User from "../models/userModel.js";

export const placeBid = async (req, res) => {
  const { bid, clerkUserId, room } = req.body;

  const clerkUser = await User.findOne({ clerkUserId });

  const newBid = new Bid({ bid, bidder: clerkUser._id, room });
  try {
    let bade = await newBid.save();

    bade = await bade.populate(
      "bidder",
      "firstName lastName profilePic clerkUserId"
    );

    bade = await bade.populate("room");

    bade = await User.populate(bade, {
      path: "room.bidders",
      select: "clerkUserId firstName lastName profilePic",
    });

    let updatedRoom = await Room.findByIdAndUpdate(room, { currentBid: bade });

    updatedRoom = await Room.findById(room)
      .populate("currentBid", "bid bidder")
      .populate("roomAdmin", "firstName lastName profilePic")
      .populate("bidders", "clerkUserId firstName lastName profilePic");

    res.status(201).json({ bade, updatedRoom });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const fetchBids = async (req, res) => {
  const { roomId } = req.params;

  try {
    const bids = await Bid.find({ room: roomId })
      .populate("bidder", "firstName lastName profilePic clerkUserId")
      .sort({ _id: -1 });

    res.status(201).json(bids);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
