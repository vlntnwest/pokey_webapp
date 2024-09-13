import { combineReducers } from "redux";
import mealReducer from "./meal.reducer";
import orderReducer from "./order.reducer";
import userReducer from "./user.reducer";

export default combineReducers({
  mealReducer,
  orderReducer,
  userReducer,
});
