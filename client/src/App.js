import React, { useEffect, useState } from "react";
import Routes from "./components/Routes";
import { UidContext } from "./components/Context/AppContext";
import { useDispatch } from "react-redux";
import axios from "axios";
import { getUser } from "./actions/user.action";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./Theme";

const App = () => {
  const [uid, setUid] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}jwtid`, {
          withCredentials: true,
        });
        setUid(res.data);
      } catch (err) {
        console.log("No token");
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    if (uid) {
      dispatch(getUser(uid));
    }
  }, [uid, dispatch]);

  useEffect(() => {
    if (uid) {
      dispatch(getUser(uid));
    }
  }, [uid, dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UidContext.Provider value={uid}>
        <Routes />
      </UidContext.Provider>
    </ThemeProvider>
  );
};
export default App;
