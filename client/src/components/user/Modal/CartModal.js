import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import Modal from "@mui/material/Modal";
import { motion, AnimatePresence } from "framer-motion";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const style = {
  position: "absolute",
  bottom: "0",
  left: "0",
  width: "100vw",
  height: "99vh",
  bgcolor: "background.paper",
  borderRadius: "16px 16px 0 0",
  boxShadow: 24,
  p: 4,
};

const modalVariants = {
  hidden: {
    y: "100vh",
    opacity: 0,
  },
  visible: {
    y: "0",
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
  exit: {
    y: "100vh",
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const CartModal = ({ btnTxt }) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <IconButton color="primary" onClick={handleOpen}>
        {btnTxt}
      </IconButton>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ position: "absolute", bottom: 0, left: 0, width: "100%" }}>
          <AnimatePresence>
            {open && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={modalVariants}
                style={{ width: "100%" }}
              >
                <Box sx={style}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      id="modal-modal-title"
                      variant="h6"
                      component="h2"
                    >
                      Text in a modal
                    </Typography>
                    <IconButton onClick={handleClose}>
                      <CloseRoundedIcon />
                    </IconButton>
                  </Box>
                  <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                    Duis mollis, est non commodo luctus, nisi erat porttitor
                    ligula.
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Modal>
    </>
  );
};

export default CartModal;
