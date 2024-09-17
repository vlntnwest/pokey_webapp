import * as React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import OrdersContainer from "./OrdersContainer";
import ArchivedOrders from "./ArchivedOrders";
import TablesList from "./TablesList";

const AdminTabs = () => {
  const [value, setValue] = React.useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Orders" value="1" />
            <Tab label="Archive" value="2" />
            <Tab label="Tables" value="3" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <OrdersContainer />
        </TabPanel>
        <TabPanel value="2">
          <ArchivedOrders />
        </TabPanel>
        <TabPanel value="3">
          <TablesList />
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default AdminTabs;
