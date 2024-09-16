import axios from "axios";

export const GET_TABLES = "GET_TABLES";

export const getTables = () => {
  return (dispatch) => {
    return axios
      .get(`${process.env.REACT_APP_API_URL}api/table`)
      .then((res) => {
        dispatch({ type: GET_TABLES, payload: res.data });
      });
  };
};
