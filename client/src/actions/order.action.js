import axios from "axios";

export const GET_ORDERS = "GET_ORDERS";
export const TOGGLE_ARCHIVE = "TOGGLE_ARCHIVE";

export const getOrders = () => {
  return (dispatch) => {
    return axios
      .get(`${process.env.REACT_APP_API_URL}api/order`)
      .then((res) => {
        dispatch({ type: GET_ORDERS, payload: res.data });
      });
  };
};

export const toggleArchive = (payload) => async (dispatch) => {
  try {
    await axios.put(
      `${process.env.REACT_APP_API_URL}api/order/${payload.id}/toggle`
    );
    dispatch({ type: "TOGGLE_ARCHIVE", payload: payload });
  } catch (error) {
    console.error("Error while toggling archive", error);
  }
};
