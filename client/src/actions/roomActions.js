import toast from "react-hot-toast";
import * as api from "../api";
import {
  END_LOADING,
  CREATE_POST,
  START_LOADING,
  FETCH_ALL_ROOMS,
  FETCH_ROOM,
  JOIN_ROOM,
  PLACE_BID,
  FETCH_ALL_BIDS,
  FETCH_ORDERS,
} from "@/constants/actionTypes";

export const createPost = (newPost, navigate) => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING });

    const { data } = await api.createPost(newPost);

    dispatch({ type: CREATE_POST, payload: data }); //sends to reducer

    dispatch({ type: END_LOADING });

    navigate("/");
  } catch (err) {
    console.log(err);

    toast.error("Failed to create room");

    dispatch({ type: END_LOADING });
  }
};

export const getRoom = (roomId, navigate) => async (dispatch) => {
  try {
    const toastId = toast("Loading..");

    const { data } = await api.fetchRoom(roomId);

    dispatch({ type: FETCH_ROOM, payload: data }); //sends to reducer

    toast.dismiss(toastId);

    navigate(`/room/${roomId}`);
  } catch (err) {
    console.log(err);

    // toast.error("Error fetching room");
  }
};

export const joinRoom = (idz) => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING });

    const { data } = await api.joinRoom(idz);

    dispatch({ type: JOIN_ROOM, payload: data }); //sends to reducer

    dispatch({ type: END_LOADING });
  } catch (err) {
    console.log(err);

    // toast.error("Error registering room");

    dispatch({ type: END_LOADING });
  }
};

export const placeBid = (bidData, socket) => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING });

    const {
      data: { bade, updatedRoom },
    } = await api.placeBid(bidData);

    dispatch({ type: PLACE_BID, payload: bade });

    dispatch({ type: FETCH_ROOM, payload: updatedRoom }); //sends to reducer

    dispatch({ type: END_LOADING });

    socket.emit("new bid", bade);

    socket.emit("updated room", updatedRoom);
  } catch (err) {
    console.log(err);

    // toast.error("Error placing bid");

    dispatch({ type: END_LOADING });
  }
};

export const getAllBids = (roomId, socket) => async (dispatch) => {
  try {
    const { data } = await api.fetchAllBids(roomId);

    dispatch({ type: FETCH_ALL_BIDS, payload: data }); //sends to reducer

    socket.emit("join room", roomId);
  } catch (err) {
    console.log(err);

    // toast.error("Error fetching bids");

    dispatch({ type: END_LOADING });
  }
};

export const getAllRooms = () => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING });

    const { data } = await api.fetchAllRooms();

    dispatch({ type: FETCH_ALL_ROOMS, payload: data }); //sends to reducer

    dispatch({ type: END_LOADING });
  } catch (err) {
    console.log(err);

    // toast.error("Error fetching rooms");

    dispatch({ type: END_LOADING });
  }
};

export const getOrders = (userId, navigate) => async (dispatch) => {
  try {
    const toastId = toast("Loading..");

    const { data } = await api.fetchOrders(userId);

    dispatch({ type: FETCH_ORDERS, payload: data }); //sends to reducer

    toast.dismiss(toastId);

    navigate("/my-orders");
  } catch (err) {
    console.log(err);

    // toast.error("Error fetching orders");

    dispatch({ type: END_LOADING });
  }
};
