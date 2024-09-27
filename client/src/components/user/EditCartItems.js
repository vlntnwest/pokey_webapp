import React from "react";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

const EditCartItems = ({ toggleDrawer }) => {
  return (
    <>
      <Box
        style={{
          position: "sticky",
          top: "0",
          borderBottom: "1px solid #0000000a",
          zIndex: 10,
        }}
      >
        <AppBar
          component="nav"
          style={{
            background: "#fff",
            boxShadow: "none",
            position: "sticky",
            top: "0",
          }}
        >
          <Toolbar style={{ padding: "0 8px" }}>
            <IconButton>
              <DeleteOutlineRoundedIcon />
            </IconButton>
            <Box
              sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}
            >
              <Typography variant="h3" color="textPrimary">
                California
              </Typography>
            </Box>
            <IconButton onClick={toggleDrawer(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Box>
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box py={4}>
            <Box sx={{ width: 200 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                }}
              >
                <IconButton>
                  <RemoveCircleOutlineIcon
                    color="primary"
                    sx={{ width: 36, height: 36 }}
                  />
                </IconButton>
                <span>
                  <Typography fontSize={28}>1</Typography>
                </span>
                <IconButton>
                  <AddCircleOutlineIcon
                    color="primary"
                    sx={{ width: 36, height: 36 }}
                  />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box px={2} pb={2}>
        <Button variant="contained" fullWidth sx={{ py: 1.5 }}>
          Mettre à jour
        </Button>
      </Box>
    </>
  );
};

export default EditCartItems;
