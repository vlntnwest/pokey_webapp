import axios from "axios";

export const GET_MEALS = "GET_MEALS";

export const getMeals = () => {
  return (dispatch) => {
    return axios
      .get(`${process.env.REACT_APP_API_URL}api/order`)
      .then((res) => {
        dispatch({ type: GET_MEALS, payload: res.data });
      });
  };
};
