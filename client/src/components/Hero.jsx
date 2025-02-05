import React from "react";

const Hero = () => {
  return (
    <div className="py-14">
      <blockquote class="text-2xl font-semibold italic text-center text-slate-900">
        Be in the{" "}
        <span class="before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-pink-500 relative inline-block">
          <span class="relative text-white">auction</span>
        </span>{" "}
        room, wherever you are.
      </blockquote>
    </div>
  );
};

export default Hero;
