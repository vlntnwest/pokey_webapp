import { GET_TABLES } from "../actions/table.action";

const initialState = {};

export default function tableReducer(state = initialState, action) {
  switch (action.type) {
    case GET_TABLES:
      return action.payload;
    default:
      return state;
  }
}
