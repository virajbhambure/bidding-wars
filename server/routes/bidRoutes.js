import express from "express";
import { fetchBids, placeBid } from "../controllers/bidControllers.js";

const router = express.Router();

// api/bid
router.route("/").post(placeBid);
router.route("/:roomId").get(fetchBids);

export default router;
