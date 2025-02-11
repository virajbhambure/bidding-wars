import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import colors from "colors";
import roomRoutes from "./routes/roomRoutes.js";
import { Webhook } from "svix";
import bodyParser from "body-parser";
import User from "./models/userModel.js";
import mongoose from "mongoose";
import bidRoutes from "./routes/bidRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import { Server } from "socket.io";

const app = express();

app.use(
  cors({
    origin: "https://bidding-wars-frontend.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

//enable us to send post req
app.use(
  bodyParser.json({
    verify: function (req, res, buf) {
      req.rawBody = buf;
    },
  })
);
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use("/api/stripe", stripeRoutes);

app.use(express.json());

app.use("/api/room", roomRoutes);

app.use("/api/bid", bidRoutes);

app.use("/api/orders", orderRoutes);

config();

connectDB();

app.post(
  "/api/webhooks",
  bodyParser.raw({ type: "application/json" }),
  async function (req, res) {
    try {
      const payloadString = JSON.stringify(req.body);
      const svixHeaders = req.headers;

      const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET_KEY);
      const evt = wh.verify(payloadString, svixHeaders);

      const { id, ...attributes } = evt.data;
      console.log("Event Type: ", attributes.first_name);
      const eventType = evt.type;

      if (eventType === "user.created") {
        const firstName = attributes.first_name;
        const lastName = attributes.last_name;
        const profilePic = attributes.profile_image_url;

        const user = new User({
          clerkUserId: id,
          firstName: firstName,
          lastName: lastName,
          profilePic: profilePic,
        });

        await user.save();
        console.log("User is created");
      }

      res.status(200).json({
        success: true,
        message: "Webhook received",
      });
    } catch (error) {
      console.log(error.message),
        res.status(400).json({
          success: false,
          message: error.message,
        });
    }
  }
);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server Started on PORT: ${PORT}`.yellow);
});

const io = new Server(server, {
  pingTimeout: 60000, // amount of time it will wait while being inactive
  cors: {
    origin: "https://bidding-wars-frontend.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  //personal room
  // console.log("Connected to socket.io");
  socket.on("setup", (clerkUserId) => {
    socket.join(clerkUserId);
    socket.emit("connected");
    // console.log("User: " + clerkUserId);
  });

  socket.on("join room", (room) => {
    socket.join(room);
    // console.log("User Joined Room: " + room);
  });

  socket.on("new bid", (newBidReceived) => {
    let room = newBidReceived.room;

    if (!room.bidders) return console.log("room.bidders not defined");

    room.bidders.forEach((bidder) => {
      if (bidder.clerkUserId === newBidReceived.bidder.clerkUserId) return;

      socket.in(bidder.clerkUserId).emit("bid received", newBidReceived);
    });
  });

  socket.on("updated room", (updatedRoomReceived) => {
    if (!updatedRoomReceived.bidders)
      return console.log("room.bidders not defined");

    updatedRoomReceived.bidders.forEach((bidder) => {
      if (bidder._id === updatedRoomReceived.currentBid._id) return;

      socket
        .in(bidder.clerkUserId)
        .emit("updated room received", updatedRoomReceived);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(clerkUserId);
  });
});
