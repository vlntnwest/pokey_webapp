import React, { useContext, useEffect } from "react";
import LogModal from "../components/Modal/LogModal";
import { UidContext } from "../components/AppContext";
import AdminHeader from "../components/adminComponents/AdminHeader";
import { useDispatch } from "react-redux";
import { getOrders } from "../actions/order.action";
import Tabs from "../components/adminComponents/Tabs";

const Admin = () => {
  const uid = useContext(UidContext);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(getOrders());
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [dispatch]);

  if (uid) {
    return (
      <>
        <AdminHeader />
        <Tabs />
      </>
    );
  }

  return <LogModal />;
};

export default Admin;
