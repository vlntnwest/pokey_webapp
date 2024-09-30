import React, { useContext, useEffect } from "react";
import LogModal from "../components/admin/Modal/LogModal";
import { UidContext } from "../components/Context/AppContext";
import AdminHeader from "../components/admin/adminComponents/AdminHeader";
import { useDispatch } from "react-redux";
import { getOrders } from "../actions/order.action";
import Tabs from "../components/admin/adminComponents/Tabs";

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
