import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllRooms } from "@/actions/roomActions";
import Hero from "@/components/Hero";
import RoomCard from "@/components/RoomCard";

const CustomSkeleton = () => {
  return (
    <div className="flex flex-col border-2 border-slate-200 border-b-indigo-500 bg-white rounded-md shadow-sm animate-pulse">
      <div className="flex justify-center items-center h-56 bg-gray-100">
        <div className="p-5 w-48 h-56 flex items-center justify-center"></div>
      </div>
      <div className="rounded-b-md h-full p-5 space-y-3">
        <div className="h-6 w-3/4 bg-gray-300 rounded animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-4 w-1/2 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 w-2/3 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 w-full bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="flex justify-end pt-3">
          <div className="h-10 w-24 bg-gray-300 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

const Homepage = () => {
  const dispatch = useDispatch();
  const { rooms, isLoading } = useSelector((state) => state?.rooms);

  useEffect(() => {
    dispatch(getAllRooms());
  }, [dispatch]);

  const parseDate = (dateString) => {
    return new Date(dateString.replace(" ", "T"));
  };

  const currentDate = new Date();

  const liveRooms = rooms?.filter(
    (room) => parseDate(room?.endsOn) > currentDate
  );

  const pastRooms = rooms?.filter(
    (room) => parseDate(room?.endsOn) <= currentDate
  );

  const skeletonCount = 4;

  return (
    <div className="text-slate-900">
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>

      <Hero />
      <div className="p-5 pt-0 sm:p-14 sm:pt-0">
        <p className="text-2xl font-semibold lowercase text-[#414ea1]">
          Live auctions
        </p>
        <div className="py-8">
          {isLoading ? (
            <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(skeletonCount)].map((_, index) => (
                <CustomSkeleton key={`live-skeleton-${index}`} />
              ))}
            </div>
          ) : !liveRooms?.length ? (
            <p>No live auctions found</p>
          ) : (
            <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {liveRooms.map((room) => (
                <RoomCard key={room?._id} room={room} />
              ))}
            </div>
          )}
        </div>

        <p className="pt-5 text-2xl font-semibold lowercase text-[#414ea1]">
          Past auctions
        </p>
        <div className="py-8">
          {isLoading ? (
            <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(skeletonCount)].map((_, index) => (
                <CustomSkeleton key={`past-skeleton-${index}`} />
              ))}
            </div>
          ) : !pastRooms?.length ? (
            <p>No past auctions found</p>
          ) : (
            <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {pastRooms.map((room) => (
                <RoomCard key={room?._id} room={room} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
