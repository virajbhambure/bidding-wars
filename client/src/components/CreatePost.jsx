import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "@clerk/clerk-react";
import { createPost } from "@/actions/roomActions";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { format } from "date-fns";

const CreatePost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading } = useSelector((state) => state?.rooms);

  const [roomName, setRoomName] = useState("");
  const [openingBid, setOpeningBid] = useState("");
  const [itemPic, setItemPic] = useState("");
  const [date, setDate] = useState(null);
  const { isSignedIn, userId } = useAuth();

  function uploadToCloudinary(e) {
    const data = new FormData();
    data.append("file", e.target.files[0]);
    data.append("upload_preset", "zngtpman");
    data.append("cloud_name", "dxykak5rw");

    fetch("https://api.cloudinary.com/v1_1/dxykak5rw/image/upload", {
      method: "post",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setItemPic(data.url);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const submitPost = (e) => {
    e.preventDefault();

    const formattedDateTime = date ? format(date, "yyyy-MM-dd HH:mm:ss") : null;

    if (isSignedIn) {
      dispatch(
        createPost(
          {
            roomName,
            itemPic,
            openingBid,
            endsOn: formattedDateTime,
            clerkUserId: userId,
          },
          navigate
        )
      );
    } else {
      toast.error("Please sign in first");
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full sm:w-1/2 text-slate-800 p-6">
        <p className="text-2xl font-semibold my-6">Create post for auction</p>
        <form onSubmit={submitPost} className="flex flex-col gap-3">
          <Input
            name="roomName"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            type="text"
            placeholder="Name your item"
          />
          <Input
            name="openingBid"
            value={openingBid}
            onChange={(e) => setOpeningBid(e.target.value)}
            type="number"
            placeholder="What to start your auction at"
          />
          <Input type="file" onChange={uploadToCloudinary} />
          <DatePicker
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            selected={date}
            onChange={(date) => setDate(date)}
            minDate={new Date()}
            placeholderText="Select end date"
          />
          <div className="flex justify-end">
            <Button disabled={isLoading}>
              {isLoading ? "Posting.." : "Post"}
            </Button>
          </div>
        </form>
      </div>{" "}
    </div>
  );
};

export default CreatePost;
