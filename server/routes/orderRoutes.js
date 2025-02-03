import express from "express";
import { fetchOrders } from "../controllers/orderControllers.js";

const router = express.Router();

// api/orders
router.route("/:clerkUserId").get(fetchOrders);

export default router;
