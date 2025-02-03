import express from "express";
import {
  createRoom,
  fetchAllRooms,
  fetchRoom,
  joinRoom,
} from "../controllers/roomControllers.js";

const router = express.Router();

// api/room
router.route("/").get(fetchAllRooms);
router.route("/:roomId").get(fetchRoom);
router.route("/").post(createRoom);
router.route("/join").put(joinRoom);

export default router;
