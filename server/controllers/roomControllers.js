import Room from "../models/roomModel.js";
import User from "../models/userModel.js";

export const createRoom = async (req, res) => {
  const { roomName, itemPic, openingBid, endsOn, clerkUserId } = req.body;

  const clerkUser = await User.findOne({ clerkUserId });

  const newRoom = new Room({
    roomName,
    itemPic,
    openingBid,
    endsOn,
    roomAdmin: clerkUser._id,
  });
  try {
    const room = await newRoom.save();

    res.status(201).json(room);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const joinRoom = async (req, res) => {
  const { roomId, clerkUserId } = req.body;

  const clerkUser = await User.findOne({ clerkUserId });

  try {
    let added = await Room.findByIdAndUpdate(
      roomId,
      {
        $push: { bidders: clerkUser._id },
      },
      { new: true }
    );

    added = await Room.findById(roomId)
      .populate("currentBid", "bid")
      .populate("roomAdmin", "firstName lastName profilePic clerkUserId")
      .populate("bidders", "clerkUserId firstName lastName profilePic");

    res.status(201).json(added);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const fetchAllRooms = async (req, res) => {
  try {
    const allRooms = await Room.find({})
      .sort({ _id: -1 })
      .populate("currentBid", "bid");

    res.status(201).json(allRooms);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const fetchRoom = async (req, res) => {
  const { roomId } = req.params;

  try {
    let room = await Room.findById(roomId)
      .populate("currentBid", "bid bidder")
      .populate("roomAdmin", "firstName lastName profilePic clerkUserId")
      .populate("bidders", "clerkUserId firstName lastName profilePic");

    room = await User.populate(room, {
      path: "currentBid.bidder",
      select: "clerkUserId firstName lastName profilePic",
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
