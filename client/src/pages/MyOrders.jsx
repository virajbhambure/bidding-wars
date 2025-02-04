import moment from "moment";
import React from "react";
import { useSelector } from "react-redux";

const MyOrders = () => {
  const { myOrders } = useSelector((state) => state?.rooms);

  return (
    <div className="flex justify-center">
      <div className="w-full lg:w-1/2 text-slate-800 p-6 pb-12">
        <p className="text-2xl my-6">My orders</p>
        {!myOrders.length ? (
          <div className="bg-zinc-100 p-6 rounded-md">No orders yet 🐣</div>
        ) : (
          <div className="flex flex-col gap-12 bg-zinc-100 p-6 rounded-md">
            {myOrders?.map((order) => (
              <div
                className="flex sm:flex-row flex-col sm:gap-0 gap-3 sm:justify-between sm:items-center"
                key={order._id}
              >
                {/* left */}
                <div className="sm:w-1/3 flex gap-3">
                  <img className="w-20" src={order.pic} alt="pic" />
                  <div className="flex flex-col justify-center">
                    <p className="text-lg">{order.name}</p>
                    <p>
                      Price:{" "}
                      <span className="text-lg">&#36;{order.amount}</span>
                    </p>
                  </div>
                </div>

                <div className="sm:w-1/3  flex sm:gap-0 gap-2 sm:flex-col items-center">
                  <p>Status</p>
                  <p className="bg-blue-100 text-blue-600 px-3 py-2 rounded-md font-medium text-sm">
                    In-Transit
                  </p>
                </div>

                <div className="sm:w-1/3 ">
                  <p>Delivery expected by</p>
                  <p className="text-lg">
                    {" "}
                    {order?.createdAt
                      ? moment(order.createdAt)
                          .add(6, "days")
                          .format("MMMM Do YYYY")
                      : "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
