import axios from "axios";

export const GET_TABLES = "GET_TABLES";
export const GET_TABLE = "GET_TABLE";
export const TOGGLE_TABLES = "TOGGLE_TABLES";

export const getTables = () => {
  return (dispatch) => {
    return axios
      .get(`${process.env.REACT_APP_API_URL}api/table`)
      .then((res) => {
        dispatch({ type: GET_TABLES, payload: res.data });
      });
  };
};

export const getTable = (tableNumber) => {
  return (dispatch) => {
    return axios
      .get(`${process.env.REACT_APP_API_URL}api/table/${tableNumber}`)
      .then((res) => {
        dispatch({ type: GET_TABLE, payload: res.data });
      });
  };
};

export const toggleTables = (payload) => async (dispatch) => {
  try {
    await axios.put(
      `${process.env.REACT_APP_API_URL}api/table/${payload._id}/toggle`
    );
    dispatch({ type: "TOGGLE_TABLES", payload: payload });
  } catch (error) {
    console.error("Error while toggling tables", error);
  }
};
