import React, { useEffect, useState } from "react";
import LogModal from "../components/admin/Modal/LogModal";
import { UidContext } from "../components/Context/AppContext";
import AdminHeader from "../components/admin/adminComponents/AdminHeader";
import { useDispatch } from "react-redux";
import Tabs from "../components/admin/adminComponents/Tabs";
import axios from "axios";
import { getUser } from "../actions/user.action";

const Admin = () => {
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

  if (uid) {
    return (
      <UidContext.Provider value={uid}>
        <AdminHeader />
        <Tabs />
      </UidContext.Provider>
    );
  }

  return <LogModal />;
};

export default Admin;
