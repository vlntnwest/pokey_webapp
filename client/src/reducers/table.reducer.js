import { GET_TABLES, TOGGLE_TABLES } from "../actions/table.action";

const initialState = {};

export default function tableReducer(state = initialState, action) {
  switch (action.type) {
    case GET_TABLES:
      return action.payload;
    case TOGGLE_TABLES:
      return state.map((table) =>
        table._id === action.payload._id
          ? { ...table, isOpen: !table.isOpen }
          : table
      );
    default:
      return state;
  }
}
