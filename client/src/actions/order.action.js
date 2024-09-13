import axios from "axios";

export const GET_ORDERS = "GET_ORDERS";

export const getOrders = () => {
  return (dispatch) => {
    return axios
      .get(`${process.env.REACT_APP_API_URL}api/order`)
      .then((res) => {
        dispatch({ type: GET_ORDERS, payload: res.data });
      });
  };
};
