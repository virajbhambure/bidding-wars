import Lottie from "lottie-react";
import React from "react";
import animationData from "../animations/success_animation.json";

const OrderSuccessPage = () => {
  return (
    <div className="flex flex-col items-center text-slate-800">
      <Lottie
        animationData={animationData}
        loop={false}
        autoplay={true}
        style={{ height: 400, width: 400 }}
      />
      <p>Order placed successfully</p>
      <p className="pt-2 text-blue-600">
        Check order status in <span className="text-lg">my orders</span>
      </p>
    </div>
  );
};

export default OrderSuccessPage;
