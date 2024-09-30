import React, { useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { isEmpty } from "../../Utils";
import { Alert, CircularProgress } from "@mui/material";
import { UidContext } from "../../Context/AppContext";
import Box from "@mui/material/Box";
import Masonry from "@mui/lab/Masonry";
import OrderCard from "../OrdersComponents/OrderCard";
import { getOrders } from "../../../actions/order.action";

const OrdersContainer = () => {
  const dispatch = useDispatch();
  const uid = useContext(UidContext);

  const ordersData = useSelector((state) => state.orderReducer);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await dispatch(getOrders());
      } catch (error) {
        setError(
          error.response
            ? error.response.data.error
            : "Error fetching orders data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, uid]);

  const unarchivedOrders = !isEmpty(ordersData)
    ? ordersData.filter((order) => !order.archived)
    : [];

  const sortedOrders = unarchivedOrders.sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">Error: {error}</Alert>;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={2} sequential>
        {sortedOrders.map((order, index) => (
          <OrderCard key={index} order={order} />
        ))}
      </Masonry>
    </Box>
  );
};

export default OrdersContainer;
