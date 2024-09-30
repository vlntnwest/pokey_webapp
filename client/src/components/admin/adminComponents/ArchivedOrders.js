import {
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableContainer,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import OrderList from "../OrdersComponents/OrderList";
import { useDispatch, useSelector } from "react-redux";
import { UidContext } from "../../Context/AppContext";
import { getOrders } from "../../../actions/order.action";
import { isEmpty } from "../../Utils";

const ArchivedOrders = () => {
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

  const sortedOrders = !isEmpty(ordersData)
    ? [...ordersData].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
    : [];

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">Error: {error}</Alert>;
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableBody>
          {sortedOrders.map((order, index) => (
            <OrderList key={index} order={order} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ArchivedOrders;
