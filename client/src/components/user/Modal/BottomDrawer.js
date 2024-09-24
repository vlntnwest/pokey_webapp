import React from "react";
import {
  motion,
  useAnimate,
  useDragControls,
  useMotionValue,
} from "framer-motion";

const backgroundStyle = {
  position: "fixed",
  zIndex: 50,
  backgroundColor: "rgba(0,0,0,0.5)",
  width: "100vw",
  height: "100vh",
  top: 0,
  left: 0,
};

const childrenStyle = {
  position: "relative",
  zIndex: 0,
  height: "100%",
  overflowY: "scroll",
  padding: 10,
  paddingTop: 40,
  "&::-webkit-scrollbar": {
    display: "none",
  },

  "-msOverflowStyle": "none",
  scrollbarWidth: "none",
};

const btnContainerStyle = {
  position: "absolute",
  left: 0,
  right: 0,
  zIndex: 10,
  display: "flex",
  justifyContent: "center",
  backgroundColor: "#fff",
  padding: "8px",
  height: "24px",
  touchAction: "none",
};

const btnStyle = {
  height: "4px",
  width: "100px",
  touchAction: "none",
  borderRadius: 50,
  backgroundColor: "rgba(0,0,0,0.2)",
  cursor: "grab",
  border: "none",
};

const BottomDrawer = ({ open, setOpen, children }) => {
  const [scope, animate] = useAnimate();
  const controls = useDragControls();
  const y = useMotionValue(0);

  const handleClose = async () => {
    animate(scope.current, {
      opacity: [1, 0],
    });

    const yStart = typeof y.get() === "number" ? y.get() : 0;

    await animate("#drawer", {
      y: [yStart, 500],
    });
    setOpen(false);
  };

  return (
    <>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleClose}
          ref={scope}
          style={backgroundStyle}
        >
          <motion.div
            id="drawer"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{
              ease: "easeInOut",
            }}
            onDragEnd={() => {
              if (y.get() >= 100) {
                handleClose();
              }
            }}
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragConstraints={{
              top: 0,
              bottom: 0,
            }}
            dragElastic={{
              top: 0,
              bottom: 0.5,
            }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "95vh",
              overflow: "hidden",
              backgroundColor: "#fff",
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              y,
            }}
          >
            <div
              onPointerDown={(e) => {
                controls.start(e);
              }}
              style={btnContainerStyle}
            >
              <button style={btnStyle} />
            </div>
            <div style={childrenStyle}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default BottomDrawer;
