import React from "react";
import { AppBar, Box, IconButton, Toolbar } from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute",
  bottom: "0",
  left: "0",
  width: "100vw",
  height: "95%",
  bgcolor: "background.paper",
  borderRadius: "16px 16px 0 0",
  boxShadow: 24,
  p: 4,
};

const Header = () => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <AppBar style={{ background: "#fff", boxShadow: "none" }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <div
              style={{
                width: "100px",
                backgroundImage: "url(../img/1Fichier-21.svg)",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                textIndent: "-9999px",
              }}
            >
              Pokey bar
            </div>
          </Box>
          <IconButton color="primary" onClick={handleOpen}>
            <ShoppingBagOutlinedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Text in a modal
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography>
        </Box>
      </Modal>
    </>
  );
};

export default Header;
