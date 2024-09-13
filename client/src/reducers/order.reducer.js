import { GET_ORDERS } from "../actions/order.action";

const initialState = {};

export default function orderReducer(state = initialState, action) {
  switch (action.type) {
    case GET_ORDERS:
      return action.payload;
    default:
      return state;
  }
}
