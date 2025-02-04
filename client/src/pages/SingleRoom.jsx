import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/clerk-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { getAllBids, joinRoom, placeBid } from "@/actions/roomActions";
import { io } from "socket.io-client";
import { FETCH_ROOM, UPDATE_BIDS } from "@/constants/actionTypes";
import moment from "moment";
import { loadStripe } from "@stripe/stripe-js";

const ENDPOINT = "https://bidding-wars-backend.vercel.app";

const SingleRoom = () => {
  const dispatch = useDispatch();
  const socketRef = useRef(); //current socket
  const [inProcess, setInProcess] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const { isSignedIn, userId } = useAuth();
  const { isLoading, selectedRoom, allBids } = useSelector(
    (state) => state?.rooms
  );

  const isAuctionEnded = useMemo(() => {
    if (!selectedRoom?.endsOn) return false;
    const endDate = new Date(selectedRoom.endsOn.replace(" ", "T"));
    return endDate <= new Date();
  }, [selectedRoom?.endsOn]);


  // Time left countdown effect
  useEffect(() => {
    // Only set up countdown if auction hasn't ended
    if (!isAuctionEnded && selectedRoom?.endsOn) {
      const calculateTimeLeft = () => {
        const endDate = moment(selectedRoom.endsOn);
        const now = moment();

        if (endDate.isSameOrBefore(now)) {
          setTimeLeft("Auction Ended");
          return;
        }

        const duration = moment.duration(endDate.diff(now));

        // Format time left
        const days = duration.days();
        const hours = duration.hours();
        const minutes = duration.minutes();
        const seconds = duration.seconds();

        let timeLeftString = "";
        if (days > 0) timeLeftString += `${days}d `;
        if (hours > 0) timeLeftString += `${hours}h `;
        timeLeftString += `${minutes}m ${seconds}s`;

        setTimeLeft(timeLeftString);
      };

      // Initial calculation
      calculateTimeLeft();

      // Update every second
      const timer = setInterval(calculateTimeLeft, 1000);

      // Cleanup interval on component unmount or when auction ends
      return () => clearInterval(timer);
    }
  }, [selectedRoom?.endsOn, isAuctionEnded]);

  
  const registerToBid = () => {
    const roomId = selectedRoom?._id;
    if (isSignedIn) {
      dispatch(joinRoom({ roomId, clerkUserId: userId }));
    } else {
      toast.error("Please sign in first");
    }
  };

  const sendBid = () => {
    const room = selectedRoom?._id;
    const bid = selectedRoom?.currentBid?.bid
      ? selectedRoom?.currentBid?.bid + 1
      : selectedRoom?.openingBid + 1;
    if (isSignedIn) {
      dispatch(placeBid({ bid, clerkUserId: userId, room }, socketRef.current));
    }
  };

  //socket connection
  useEffect(() => {
    if (isSignedIn) {
      if (!socketRef.current) {
        socketRef.current = io(ENDPOINT);
      }

      socketRef.current.emit("setup", userId);
      socketRef.current.on("connection", console.log("Socket Connected"));

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [isSignedIn, userId]);

  //fetch all bids
  useEffect(() => {
    if (selectedRoom?._id) {
      dispatch(getAllBids(selectedRoom?._id, socketRef.current));
    }
  }, [selectedRoom]);

  //update bid(socket)
  useEffect(() => {
    if (isSignedIn && socketRef.current) {
      const handleBid = (newBid) => {
        if (selectedRoom?._id !== newBid.room._id) {
          //notify
        } else {
          dispatch({ type: UPDATE_BIDS, payload: newBid });
        }
      };

      socketRef.current.on("bid received", handleBid);

      return () => {
        socketRef.current.off("bid received", handleBid);
      };
    }
  }, [isSignedIn, selectedRoom, dispatch]);

  //update room(socket)
  useEffect(() => {
    if (isSignedIn && socketRef.current) {
      const handleRoomUpdate = (updatedRoomReceived) => {
        if (selectedRoom?._id !== updatedRoomReceived._id) {
          //notify
        } else {
          dispatch({ type: FETCH_ROOM, payload: updatedRoomReceived });
        }
      };

      socketRef.current.on("updated room received", handleRoomUpdate);

      return () => {
        socketRef.current.off("updated room received", handleRoomUpdate);
      };
    }
  }, [isSignedIn, selectedRoom, dispatch]);

  const makePayment = async () => {
    setInProcess(true);
    const stripe = await loadStripe(
      "pk_test_51Ptrd0Kr2vWG4UII1jNdHmT0zC28evCW85B5vtvbVuP6zWretaX4Aq8cz8Qt4dUeVN6Bcy6J2USlOlfJMIVqwxBS00ytRUAzR0"
    );

    const headers = {
      "Content-Type": "application/json",
    };

    const response = await fetch(
      "https://bidding-wars-backend.vercel.app/api/stripe/create-checkout-session",
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          roomId: selectedRoom?._id,
          name: selectedRoom?.roomName,
          pic: selectedRoom?.itemPic,
          amount: selectedRoom?.currentBid?.bid,
          userId: userId,
        }),
      }
    );

    const session = await response.json();

    const result = stripe.redirectToCheckout({
      sessionId: session.id,
    });

    setInProcess(false);

    if (result.error) {
      console.log(result.error);
      setInProcess(false);
    }
  };

  return (
     <div className="flex justify-center">
      <div className="w-full px-5 sm:px-14 min-h-screen flex sm:flex-row flex-col sm:justify-between text-slate-800">
        {/* left  */}
        <div className="py-7 flex justify-center sm:w-1/2">
          <img
            className="w-auto max-h-screen sm:pb-28"
            src={selectedRoom?.itemPic}
            alt="item-pic"
          />
        </div>

        {/* right */}
        <div className="flex flex-col py-7 sm:w-1/2">
          <div className="flex sm:flex-row flex-col sm:gap-0 gap-5 sm:justify-between">
            <div className="flex flex-col gap-3">
              <p className="text-4xl font-medium lowercase text-[#414ea1]">
                {selectedRoom?.roomName}
              </p>
              <p>
                {isAuctionEnded ? "Winning bid" : "Current bid"}: &#36;
                {selectedRoom?.currentBid
                  ? selectedRoom?.currentBid?.bid
                  : 0}{" "}
              </p>
              <p>Opening bid: &#36;{selectedRoom?.openingBid}</p>
              <p>
                {" "}
                {isAuctionEnded ? "Ended on" : "Ends on"}:{" "}
                {moment(selectedRoom?.endsOn).format(
                  "dddd, MMMM Do YYYY, h:mm A"
                )}
              </p>

              {/* Time Left Countdown */}
              {!isAuctionEnded && (
                <p className="text-red-500 font-semibold">
                  Time Left: {timeLeft}
                </p>
              )}

              {isAuctionEnded ? (
                selectedRoom?.currentBid?.bidder?.clerkUserId === userId ? (
                  <div className="pt-5">
                    <p className="pb-4 text-lg font-medium lowercase text-green-600">
                      Congrats!!🥳 you are the winner!
                    </p>
                    {selectedRoom?.claimed ? (
                      <>
                        <Button disabled={true}>Claimed</Button>
                        <p className="pt-5 text-blue-600 text-lg font-medium lowercase">
                          Check your order status in{" "}
                          <span className="italic">my orders section</span>
                        </p>
                      </>
                    ) : (
                      <Button
                        onClick={makePayment}
                        disabled={inProcess}
                        className="shadow-lg shadow-blue-500/50  bg-blue-500 hover:bg-blue-700"
                      >
                        {inProcess ? "Claiming.." : "Claim item"}
                      </Button>
                    )}
                  </div>
                ) : selectedRoom?.currentBid?.bidder ? (
                  <p className="pt-5 text-lg font-medium lowercase text-green-600">
                    Item sold to{" "}
                    <span className="italic">
                      {selectedRoom.currentBid.bidder.firstName}{" "}
                      {selectedRoom.currentBid.bidder.lastName}{" "}
                    </span>{" "}
                    🥳 for{" "}
                    <span className="">
                      &#36;
                      {selectedRoom?.currentBid?.bid}
                    </span>
                  </p>
                ) : (
                  <p className="pt-5 text-red-600 text-lg font-medium lowercase">
                    Unsold!
                  </p>
                )
              ) : null}
            </div>
            <div>
              {isAuctionEnded && (
                <Button variant={"disabled"} className="bg-zinc-200">
                  Auction Ended
                </Button>
              )}
              {!isAuctionEnded &&
                (selectedRoom?.bidders.find(
                  (bidder) => bidder.clerkUserId === userId
                ) ? (
                  <Button onClick={sendBid} className="" disabled={isLoading}>
                    {isLoading ? "Placing.." : "Place bid"}
                  </Button>
                ) : (
                  <Button
                    className=""
                    onClick={registerToBid}
                    disabled={isLoading}
                  >
                    {isLoading ? "Registering.." : "Register to bid"}
                  </Button>
                ))}{" "}
            </div>
          </div>

          <div className="pt-8">
            <p className="pb-5 font-medium">Bid history</p>
            {!allBids.length ? (
              <p className="text-sm">No bids yet</p>
            ) : (
              <div className="flex flex-col gap-5 rounded-md max-h-72 overflow-y-auto px-5 py-8 border-2 border-slate-200 border-b-indigo-500 bg-white shadow-sm">
                {allBids?.map((bid) => (
                  <div className="flex gap-2 items-center" key={bid?._id}>
                    <img
                      className="w-5 rounded-full"
                      src={bid?.bidder?.profilePic}
                      alt="profile-pic"
                    />
                    <p className="pb-[2px] text-sm">
                      {bid?.bidder?.firstName} {bid?.bidder?.lastName} outbid
                      with &#36;{bid?.bid} &#xb7;{" "}
                      <span className="text-xs italic text-slate-600">
                        {" "}
                        {moment(bid?.createdAt).fromNow()}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>{" "}
    </div>
  );
};

export default SingleRoom;
