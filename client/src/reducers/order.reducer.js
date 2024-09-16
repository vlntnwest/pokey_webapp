import { GET_ORDERS, TOGGLE_ARCHIVE } from "../actions/order.action";

const initialState = {};

export default function orderReducer(state = initialState, action) {
  switch (action.type) {
    case GET_ORDERS:
      return action.payload;
    case TOGGLE_ARCHIVE:
      return state.map((order) =>
        order._id === action.payload.id
          ? { ...order, isArchived: action.payload.isArchived }
          : order
      );
    default:
      return state;
  }
}
