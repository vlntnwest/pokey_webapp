import axios from "axios";

export const GET_DETAILS = "GET_DETAILS";

export const getDetails = () => {
  return (dispatch) => {
    return axios
      .get(`${process.env.REACT_APP_API_URL}api/item/details`)
      .then((res) => {
        dispatch({ type: GET_DETAILS, payload: res.data });
      });
  };
};
