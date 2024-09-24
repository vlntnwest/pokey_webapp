import { combineReducers } from "redux";
import mealReducer from "./meal.reducer";
import orderReducer from "./order.reducer";
import userReducer from "./user.reducer";
import tableReducer from "./table.reducer";
import detailsReducer from "./details.reducer";

export default combineReducers({
  mealReducer,
  orderReducer,
  userReducer,
  tableReducer,
  detailsReducer,
});
