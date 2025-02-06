import axios from "axios"; //used to make api calls

axios.defaults.withCredentials = true;

const API = axios.create({
  baseURL: "http://localhost:5000",
}); //points to backend routes

export const createPost = (newPost) => API.post("/api/room", newPost);
export const fetchAllRooms = () => API.get("/api/room");
export const fetchRoom = (roomId) => API.get(`/api/room/${roomId}`);
export const joinRoom = (idz) => API.put("/api/room/join", idz);
export const placeBid = (newBid) => API.post("/api/bid", newBid);
export const fetchAllBids = (roomId) => API.get(`/api/bid/${roomId}`);
export const fetchOrders = (clerkUserId) =>
  API.get(`/api/orders/${clerkUserId}`);
