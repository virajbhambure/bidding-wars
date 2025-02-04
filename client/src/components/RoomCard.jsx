import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getRoom } from "@/actions/roomActions";
import moment from "moment";

const RoomCard = ({ room }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState("");

  const isAuctionEnded = useMemo(() => {
    if (!room?.endsOn) return false;
    const endDate = new Date(room.endsOn.replace(" ", "T"));
    return endDate <= new Date();
  }, [room?.endsOn]);

  useEffect(() => {
    // Only set up countdown if auction hasn't ended
    if (!isAuctionEnded && room?.endsOn) {
      const calculateTimeLeft = () => {
        const endDate = moment(room.endsOn);
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
  }, [room?.endsOn, isAuctionEnded]);

  const singleRoom = () => {
    const roomId = room?._id;
    if (roomId) {
      dispatch(getRoom(roomId, navigate));
    }
  };

  return (
    <div
      role="button"
      onClick={singleRoom}
      className="flex flex-col border-2 border-slate-200 border-b-indigo-500 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-center items-center h-56">
        <img className="p-5 max-h-56" src={room.itemPic} alt="item-pic" />
      </div>
      <div className="rounded-b-md h-full p-5">
        <p className="text-lg font-medium pb-2 lowercase">{room?.roomName}</p>
        <p className="lowercase">
          {isAuctionEnded ? "Winning Bid" : "Current Bid"}: &#36;
          {room?.currentBid ? room?.currentBid?.bid : 0}{" "}
        </p>
        <p className="lowercase">Opening Bid: &#36;{room?.openingBid}</p>
        <p className="lowercase">
          {isAuctionEnded ? "Ended On" : "Ends On"}:{" "}
          {moment(room?.endsOn).format("dddd, MMMM Do YYYY, h:mm A")}
        </p>
        {!isAuctionEnded && (
          <p className="text-red-500 font-semibold pt-2">
            Time Left: {timeLeft}
          </p>
        )}
        <div className="flex justify-end pt-3">
          {isAuctionEnded ? (
            <Button>View Bid</Button>
          ) : (
            <Button>Place Bid</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
