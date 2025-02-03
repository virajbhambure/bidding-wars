//reducers -> controllers
//function that accepts the state and the action
//then based on the action type do some logic
//state cannot be empty -> therefore, empty arr
import {
  START_LOADING,
  END_LOADING,
  FETCH_ALL_ROOMS,
  CREATE_POST,
  FETCH_ROOM,
  JOIN_ROOM,
  PLACE_BID,
  FETCH_ALL_BIDS,
  UPDATE_BIDS,
  FETCH_ORDERS,
} from "../constants/actionTypes.js";

const initialState = {
  selectedRoom: null,
  rooms: [],
  allBids: [],
  isLoading: false,
  myOrders: [],
};

const rooms = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case START_LOADING:
      return { ...state, isLoading: true };

    case END_LOADING:
      return { ...state, isLoading: false };

    case FETCH_ALL_ROOMS:
      return { ...state, rooms: payload };

    case FETCH_ROOM:
      return { ...state, selectedRoom: payload };

    case JOIN_ROOM:
      return { ...state, selectedRoom: payload };

    case CREATE_POST:
      return { ...state, rooms: [payload, ...state.rooms] };

    case PLACE_BID:
      return { ...state, allBids: [payload, ...state.allBids] };

    case UPDATE_BIDS:
      return { ...state, allBids: [payload, ...state.allBids] };

    case FETCH_ALL_BIDS:
      return { ...state, allBids: payload };

    case FETCH_ORDERS:
      return { ...state, myOrders: payload };

    default:
      return state;
  }
};

export default rooms;
