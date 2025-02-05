import { Button } from "@/components/ui/button";
import Lottie from "lottie-react";
import React from "react";
import animationData from "../animations/cancel_animation.json";
import { Link } from "react-router-dom";

const CancelPage = () => {
  return (
    <div className="pt-12 flex flex-col items-center text-slate-800">
      <Lottie
        animationData={animationData}
        loop={false}
        autoplay={true}
        style={{ height: 200, width: 200 }}
      />
      <p className="mb-3">Order cancelled successfully</p>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
};

export default CancelPage;
