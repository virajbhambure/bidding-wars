import express from "express";
import Stripe from "stripe";
import { config } from "dotenv";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Room from "../models/roomModel.js";

config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// checkout api
router.post("/create-checkout-session", async (req, res) => {
  const { roomId, name, pic, amount, userId } = req.body;

  const customer = await stripe.customers.create({
    metadata: {
      userId: userId,
      cart: JSON.stringify({ roomId, name, pic, amount }),
    },
  });

  const lineItem = {
    price_data: {
      currency: "usd",
      product_data: {
        name: name,
        images: [pic],
        metadata: {
          id: roomId,
        },
      },
      unit_amount: amount * 100,
    },
    quantity: 1,
  };

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    shipping_address_collection: {
      allowed_countries: ["US", "IN"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 0,
            currency: "usd",
          },
          display_name: "Free shipping",

          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: 5,
            },
            maximum: {
              unit: "business_day",
              value: 7,
            },
          },
        },
      },
    ],
    // phone_number_collection: {
    //   enabled: true,
    // },
    line_items: [lineItem],
    mode: "payment",
    customer: customer.id,
    success_url: "https://bidding-wars.vercel.app/success",
    cancel_url: "https://bidding-wars.vercel.app/cancel",
  });

  res.json({ id: session.id });
});

const createOrder = async (customer, data) => {
  const item = JSON.parse(customer.metadata.cart);
  const clerkUserId = customer.metadata.userId;

  const clerkUser = await User.findOne({ clerkUserId });

  let newOrder = new Order({
    user: clerkUser._id,
    name: item.name,
    pic: item.pic,
    amount: item.amount,
    address: data.customer_details.address,
  });

  await User.findByIdAndUpdate(
    clerkUser._id, //user id
    { $push: { orders: newOrder._id } },
    { new: true }
  );

  await Room.findByIdAndUpdate(
    item.roomId, // Room ID
    { $set: { claimed: true } },
    { new: true }
  );

  try {
    await newOrder.save();
  } catch (err) {
    console.log(err);
  }
};

const webhookSecret = process.env.STRIPE_WEB_HOOK;

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];

    let data;
    let eventType;

    if (webhookSecret) {
      let event;

      try {
        event = stripe.webhooks.constructEvent(
          req.rawBody,
          signature,
          webhookSecret
        );
        console.log("Webhook Verified.");
      } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      data = event.data.object;
      eventType = event.type;
    } else {
      data = req.body.object;
      eventType = req.body.type;
    }

    if (eventType === "checkout.session.completed") {
      stripe.customers
        .retrieve(data.customer)
        .then(async (customer) => {
          try {
            createOrder(customer, data);
          } catch (err) {
            console.log(err);
          }
        })
        .catch((err) => console.log(err.message));
    }

    res.status(200).end();
  }
);

export default router;
